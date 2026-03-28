const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/search", auth, async (req, res) => {
  try {
    const term = (req.query.q || "").trim();
    if (!term) {
      return res.json({ users: [] });
    }

    const regex = new RegExp(term, "i");
    const users = await User.find({
      $or: [{ name: regex }, { username: regex }, { email: regex }],
    })
      .select("name username email")
      .limit(10);

    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: "User search failed.", error: error.message });
  }
});

module.exports = router;