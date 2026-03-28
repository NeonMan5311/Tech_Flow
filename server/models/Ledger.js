const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true, trim: true },
    settled: { type: Boolean, default: false },
    settledAt: { type: Date },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ledger", ledgerSchema);