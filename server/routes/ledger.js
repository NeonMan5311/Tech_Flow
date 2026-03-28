const express = require("express");
const Ledger = require("../models/Ledger");
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

router.post("/", auth, async (req, res) => {
  try {
    const { groupId, fromUser, toUser, amount, currency, note } = req.body;
    if (!groupId || !fromUser || !toUser || !amount || !currency) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const { error, status } = await ensureMember(groupId, req.user.id);
    if (error) {
      return res.status(status).json({ message: error });
    }

    const ledger = await Ledger.create({
      group: groupId,
      fromUser,
      toUser,
      amount: Number(amount),
      currency: currency.toUpperCase(),
      note,
      settled: true,
      settledAt: new Date(),
    });

    const populated = await Ledger.findById(ledger._id)
      .populate("fromUser", "name username")
      .populate("toUser", "name username")
      .populate("group", "name");

    return res.status(201).json({ settlement: populated });
  } catch (error) {
    return res.status(500).json({ message: "Failed to record settlement.", error: error.message });
  }
});

router.get("/group/:groupId", auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { error, status } = await ensureMember(groupId, req.user.id);
    if (error) {
      return res.status(status).json({ message: error });
    }

    const settlements = await Ledger.find({ group: groupId, settled: true })
      .sort({ settledAt: -1 })
      .populate("fromUser", "name username")
      .populate("toUser", "name username");

    return res.json({ settlements });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch settlements.", error: error.message });
  }
});

router.get("/user", auth, async (req, res) => {
  try {
    const settlements = await Ledger.find({
      settled: true,
      $or: [{ fromUser: req.user.id }, { toUser: req.user.id }],
    })
      .sort({ settledAt: -1 })
      .populate("fromUser", "name username")
      .populate("toUser", "name username")
      .populate("group", "name");

    return res.json({ settlements });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch settlements.", error: error.message });
  }
});

module.exports = router;