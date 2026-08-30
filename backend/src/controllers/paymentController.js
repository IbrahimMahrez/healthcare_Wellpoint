const asyncHandler = require("express-async-handler");
const Payment = require("../models/Payment");

// @desc   Create a payment record (integrate real gateway here: Stripe/PayPal/Fawry)
// @route  POST /api/payments/create
// @access Private
const createPayment = asyncHandler(async (req, res) => {
  const { amount, method, reference } = req.body;

  // NOTE: This is a placeholder. In production, create a real payment intent
  // with Stripe/PayPal/Fawry SDKs here, then store the resulting reference.
  const payment = await Payment.create({
    userId: req.user.id,
    amount,
    method,
    reference: reference || `SIM-${Date.now()}`,
    status: "pending",
  });

  res.status(201).json({ success: true, payment });
});

// @desc   Get my invoices / payment history
// @route  GET /api/payments/my
// @access Private
const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, payments });
});

module.exports = { createPayment, getMyPayments };
