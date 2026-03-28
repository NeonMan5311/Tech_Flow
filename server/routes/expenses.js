const express = require("express");
const fetch = require("node-fetch");
const Expense = require("../models/Expense");
const Group = require("../models/Group");
const auth = require("../middleware/auth");

const router = express.Router();

const ensureMember = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) {
    return { error: "Group not found.", status: 404 };
  }
  const isMember = group.members.some((member) => member.toString() === userId);
  if (!isMember) {
    return { error: "Access denied.", status: 403 };
  }
  return { group };
};

const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const getMonthlyOccurrenceCount = (startDate, now, interval = 1) => {
  if (!startDate || startDate > now) {
    return 0;
  }

  const safeInterval = Math.max(1, Number(interval) || 1);
  const startYear = startDate.getUTCFullYear();
  const startMonth = startDate.getUTCMonth();
  const nowYear = now.getUTCFullYear();
  const nowMonth = now.getUTCMonth();
  const monthDiff = (nowYear - startYear) * 12 + (nowMonth - startMonth);

  return Math.floor(monthDiff / safeInterval);
};

const cloneSplitDetails = (splitDetails = []) =>
  splitDetails.map((entry) => ({
    user: entry.user,
    amount: Number(entry.amount || 0),
    percentage: entry.percentage,
    shares: entry.shares,
    items: entry.items || [],
  }));

const hydrateRecurringExpenses = async (groupId) => {
  const recurringExpenses = await Expense.find({
    group: groupId,
    isRecurring: true,
    "recurrenceRule.type": "monthly",
  }).sort({ date: 1 });

  const now = new Date();

  for (const recurringExpense of recurringExpenses) {
    const occurrencesDone = Number(recurringExpense.generatedOccurrences || 0);
    const dueOccurrences = getMonthlyOccurrenceCount(new Date(recurringExpense.date), now, recurringExpense.recurrenceRule?.interval);

    if (dueOccurrences <= occurrencesDone) {
      continue;
    }

    const toCreate = dueOccurrences - occurrencesDone;

    for (let i = 1; i <= toCreate; i += 1) {
      const monthOffset = (occurrencesDone + i) * Math.max(1, Number(recurringExpense.recurrenceRule?.interval) || 1);
      const nextDate = new Date(recurringExpense.date);
      nextDate.setUTCMonth(nextDate.getUTCMonth() + monthOffset);

      await Expense.create({
        group: recurringExpense.group,
        title: recurringExpense.title,
        totalAmount: recurringExpense.totalAmount,
        currency: recurringExpense.currency,
        baseAmount: recurringExpense.baseAmount,
        paidBy: recurringExpense.paidBy,
        date: nextDate,
        splitType: recurringExpense.splitType,
        splitDetails: cloneSplitDetails(recurringExpense.splitDetails),
        exchangeRate: recurringExpense.exchangeRate,
        isRecurring: false,
      });
    }

    recurringExpense.generatedOccurrences = dueOccurrences;
    await recurringExpense.save();
  }
};

const getForexRate = async ({ baseCurrency, targetCurrency }) => {
  const base = String(baseCurrency || "").toUpperCase();
  const target = String(targetCurrency || "").toUpperCase();

  if (!base || !target || base === target) {
    return { rate: 1, convertedAmount: null };
  }

  const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${base}&symbols=${target}`);
  const data = await response.json();

  if (!response.ok || !data.rates || !data.rates[target]) {
    throw new Error("Unable to fetch exchange rate right now.");
  }

  return {
    rate: Number(data.rates[target]),
  };
};

const buildSplitDetails = ({ splitType, members, splitDetails, totalAmount }) => {
  if (splitType === "share") {
    const totalShares = splitDetails.reduce((sum, entry) => sum + Number(entry.shares || 0), 0);
    if (!totalShares) {
      return { error: "Shares are required for share split." };
    }

    return {
      splitDetails: splitDetails.map((entry) => ({
        user: entry.user,
        shares: entry.shares,
        amount: round2((totalAmount * entry.shares) / totalShares),
      })),
    };
  }

  if (splitType === "percentage") {
    const totalPercentage = splitDetails.reduce((sum, entry) => sum + Number(entry.percentage || 0), 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      return { error: "Percentages must add up to 100." };
    }

    return {
      splitDetails: splitDetails.map((entry) => ({
        user: entry.user,
        percentage: entry.percentage,
        amount: round2((totalAmount * entry.percentage) / 100),
      })),
    };
  }

  if (splitType === "item") {
    const itemAmount = splitDetails.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    if (Math.abs(itemAmount - totalAmount) > 0.01) {
      return { error: "Item amounts must add up to total amount." };
    }

    return {
      splitDetails: splitDetails.map((entry) => ({
        user: entry.user,
        amount: Number(entry.amount || 0),
        items: entry.items || [],
      })),
    };
  }

  const perHead = totalAmount / members.length;
  return {
    splitDetails: members.map((member) => ({
      user: member,
      amount: round2(perHead),
    })),
  };
};

const buildBalances = (expenses, groupMembers) => {
  const balances = new Map(groupMembers.map((member) => [member.toString(), 0]));

  for (const expense of expenses) {
    const paidBy = expense.paidBy?._id ? expense.paidBy._id.toString() : expense.paidBy.toString();
    balances.set(paidBy, round2((balances.get(paidBy) || 0) + Number(expense.baseAmount || 0)));

    for (const detail of expense.splitDetails || []) {
      const userId = detail.user?._id ? detail.user._id.toString() : detail.user.toString();
      balances.set(userId, round2((balances.get(userId) || 0) - Number(detail.amount || 0)));
    }
  }

  return balances;
};

const simplifyDebts = (balances) => {
  const creditors = [];
  const debtors = [];

  for (const [userId, balance] of balances.entries()) {
    if (balance > 0.009) creditors.push({ userId, amount: round2(balance) });
    if (balance < -0.009) debtors.push({ userId, amount: round2(-balance) });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const settledAmount = round2(Math.min(debtor.amount, creditor.amount));

    if (settledAmount > 0) {
      settlements.push({ from: debtor.userId, to: creditor.userId, amount: settledAmount });
    }

    debtor.amount = round2(debtor.amount - settledAmount);
    creditor.amount = round2(creditor.amount - settledAmount);

    if (debtor.amount <= 0.009) i += 1;
    if (creditor.amount <= 0.009) j += 1;
  }

  return settlements;
};

router.post("/", auth, async (req, res) => {
  try {
    const {
      groupId,
      title,
      totalAmount,
      currency,
      paidBy,
      splitType = "equal",
      splitDetails = [],
      date,
      isRecurring = false,
      recurrenceRule,
      baseCurrency = "INR",
    } = req.body;

    if (!groupId || !title || !totalAmount || !currency || !paidBy) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const { group, error, status } = await ensureMember(groupId, req.user.id);
    if (error) {
      return res.status(status).json({ message: error });
    }

    const fx = await getForexRate({
      baseCurrency: currency,
      targetCurrency: baseCurrency,
    });

    const baseAmount = round2(Number(totalAmount) * Number(fx.rate || 1));

    const split = buildSplitDetails({
      splitType,
      members: group.members,
      splitDetails,
      totalAmount: baseAmount,
    });

    if (split.error) {
      return res.status(400).json({ message: split.error });
    }

    const expense = await Expense.create({
      group: groupId,
      title,
      totalAmount: Number(totalAmount),
      currency: currency.toUpperCase(),
      baseAmount,
      paidBy,
      date: date ? new Date(date) : new Date(),
      splitType,
      splitDetails: split.splitDetails,
      exchangeRate: fx.rate,
      isRecurring,
      recurrenceRule: isRecurring
        ? {
            type: recurrenceRule?.type || "monthly",
            day: recurrenceRule?.day,
            interval: recurrenceRule?.interval || 1,
          }
        : undefined,
      generatedOccurrences: 0,
    });

    const populated = await Expense.findById(expense._id)
      .populate("paidBy", "name username")
      .populate("splitDetails.user", "name username");

    return res.status(201).json({ expense: populated });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create expense.", error: error.message });
  }
});

router.get("/summary/user", auth, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id }).select("_id members name");
    const groupIds = groups.map((group) => group._id);

    const expenses = await Expense.find({ group: { $in: groupIds } })
      .populate("paidBy", "name username")
      .populate("splitDetails.user", "name username")
      .populate("group", "name");

    const totals = {
      owe: 0,
      owed: 0,
      net: 0,
    };

    const byMember = new Map();

    for (const expense of expenses) {
      const payerId = expense.paidBy?._id?.toString() || expense.paidBy.toString();
      for (const detail of expense.splitDetails || []) {
        const participantId = detail.user?._id?.toString() || detail.user.toString();
        const amount = Number(detail.amount || 0);

        if (participantId === payerId) continue;

        if (participantId === req.user.id) {
          const key = payerId;
          const existing = byMember.get(key) || {
            userId: key,
            userName: expense.paidBy?.name || "Member",
            amount: 0,
          };
          existing.amount = round2(existing.amount - amount);
          byMember.set(key, existing);
        }

        if (payerId === req.user.id) {
          const key = participantId;
          const existing = byMember.get(key) || {
            userId: key,
            userName: detail.user?.name || "Member",
            amount: 0,
          };
          existing.amount = round2(existing.amount + amount);
          byMember.set(key, existing);
        }
      }
    }

    const people = Array.from(byMember.values()).map((entry) => {
      if (entry.amount < 0) {
        totals.owe = round2(totals.owe + Math.abs(entry.amount));
      } else {
        totals.owed = round2(totals.owed + entry.amount);
      }

      return {
        ...entry,
        direction: entry.amount < 0 ? "you_owe" : "owes_you",
        amount: round2(Math.abs(entry.amount)),
      };
    });

    totals.net = round2(totals.owed - totals.owe);

    return res.json({
      summary: totals,
      people,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user summary.", error: error.message });
  }
});


router.get("/:groupId", auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { error, status, group } = await ensureMember(groupId, req.user.id);
    if (error) {
      return res.status(status).json({ message: error });
    }

    await hydrateRecurringExpenses(groupId);

    const expenses = await Expense.find({ group: groupId })
      .sort({ date: -1 })
      .populate("paidBy", "name username")
      .populate("splitDetails.user", "name username");

    const balances = buildBalances(expenses, group.members);
    const simplified = simplifyDebts(balances);

    return res.json({ expenses, simplifiedSettlements: simplified });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch expenses.", error: error.message });
  }
});


module.exports = router;
