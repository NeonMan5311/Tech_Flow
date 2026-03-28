const express = require("express");
const fetch = require("node-fetch");
const auth = require("../middleware/auth");

const router = express.Router();
const FOREX_API_KEY = process.env.FOREX_API_KEY;

router.get("/rate", auth, async (req, res) => {
  try {
    const { base = "USD", target = "INR" } = req.query;

    if (!FOREX_API_KEY) {
      return res
        .status(500)
        .json({ message: "FOREX_API_KEY is not set on the server." });
    }

    const url = `https://v6.exchangerate-api.com/v6/${FOREX_API_KEY}/latest/${base}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.result !== "success") {
      return res.status(500).json({
        message: "Failed to fetch exchange rate.",
        error: data?.["error-type"] || "Unknown error",
      });
    }

    const rate = data.conversion_rates?.[target.toUpperCase()];
    if (!rate) {
      return res.status(400).json({ message: "Target currency not supported." });
    }

    return res.json({
      base: base.toUpperCase(),
      target: target.toUpperCase(),
      rate,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ message: "Forex lookup failed.", error: error.message });
  }
});

module.exports = router;