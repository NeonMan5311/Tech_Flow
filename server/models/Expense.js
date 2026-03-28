const mongoose = require("mongoose");

const splitDetailSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    percentage: { type: Number, min: 0, max: 100 },
    shares: { type: Number, min: 0 },
    items: [{ type: String, trim: true }],
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    title: { type: String, required: true, trim: true },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true, trim: true },
    baseAmount: { type: Number, required: true, min: 0 },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    splitType: {
      type: String,
      enum: ["equal", "percentage", "share", "item"],
      default: "equal",
    },
    splitDetails: [splitDetailSchema],
    exchangeRate: { type: Number, min: 0 },
    isRecurring: { type: Boolean, default: false },
    recurrenceRule: {
      type: {
        type: String,
        enum: ["daily", "weekly", "monthly", "yearly"],
      },
      day: { type: Number, min: 1, max: 31 },
      interval: { type: Number, min: 1 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);