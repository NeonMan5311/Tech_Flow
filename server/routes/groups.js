const express = require("express");
const Group = require("../models/Group");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { name, memberIds = [] } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Group name is required." });
    }

    const uniqueMembers = new Set([
      req.user.id,
      ...memberIds.filter((id) => Boolean(id)),
    ]);

    const members = await User.find({ _id: { $in: Array.from(uniqueMembers) } });
    if (!members.length) {
      return res.status(400).json({ message: "No valid members provided." });
    }

    const group = await Group.create({
      name,
      members: members.map((user) => user._id),
    });

    const populated = await Group.findById(group._id).populate(
      "members",
      "name username email"
    );

    return res.status(201).json({ group: populated });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create group.", error: error.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id }).populate(
      "members",
      "name username email"
    );

    return res.json({ groups });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch groups.", error: error.message });
  }
});

router.get("/:groupId", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate(
      "members",
      "name username email"
    );

    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    const isMember = group.members.some(
      (member) => member._id.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied." });
    }

    return res.json({ group });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch group.", error: error.message });
  }
});

module.exports = router;