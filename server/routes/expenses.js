const express = require("express");
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
        amount: (totalAmount * entry.shares) / totalShares,
      })),
    };
  }

  if (splitType === "percentage") {
    const totalPercentage = splitDetails.reduce(
      (sum, entry) => sum + Number(entry.percentage || 0),
      0
    );
    if (!totalPercentage) {
      return { error: "Percentages are required for percentage split." };
    }

    return {
      splitDetails: splitDetails.map((entry) => ({
        user: entry.user,
        percentage: entry.percentage,
        amount: (totalAmount * entry.percentage) / 100,
      })),
    };
  }

  if (splitType === "item") {
    const itemAmount = splitDetails.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    if (!itemAmount) {
      return { error: "Item amounts are required for item split." };
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
      amount: perHead,
    })),
  };
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
    } = req.body;

    if (!groupId || !title || !totalAmount || !currency || !paidBy) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const { group, error, status } = await ensureMember(groupId, req.user.id);
    if (error) {
      return res.status(status).json({ message: error });
    }

    const baseAmount = Number(totalAmount);
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
      totalAmount: baseAmount,
      currency: currency.toUpperCase(),
      baseAmount,
      paidBy,
      splitType,
      splitDetails: split.splitDetails,
    });

    const populated = await Expense.findById(expense._id)
      .populate("paidBy", "name username")
      .populate("splitDetails.user", "name username");

    return res.status(201).json({ expense: populated });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create expense.", error: error.message });
  }
});

router.get("/:groupId", auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { error, status } = await ensureMember(groupId, req.user.id);
    if (error) {
      return res.status(status).json({ message: error });
    }

    const expenses = await Expense.find({ group: groupId })
      .sort({ date: -1 })
      .populate("paidBy", "name username")
      .populate("splitDetails.user", "name username");

    return res.json({ expenses });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch expenses.", error: error.message });
  }
});

module.exports = router;