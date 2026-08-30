const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["stripe", "paypal", "fawry", "vodafone_cash", "cash"], required: true },
    status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    reference: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
