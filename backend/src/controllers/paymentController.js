const asyncHandler = require("express-async-handler");
const axios = require("axios");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/Payment");
const notify = require("../services/notify");

const FAWRY_BASE_URL = process.env.FAWRY_BASE_URL || "https://accept.fawrystaging.com";

const createStripePayment = asyncHandler(async (req, res) => {
  const { amount, currency = "egp" } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency,
          product_data: { name: "Healthcare Payment", description: "Payment for healthcare services" },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/payments?success=true`,
    cancel_url: `${process.env.CLIENT_URL}/payments?canceled=true`,
  });

  const payment = await Payment.create({
    userId: req.user.id,
    amount,
    method: "stripe",
    status: "paid",
    reference: session.id,
  });

  res.status(201).json({ success: true, payment, checkoutUrl: session.url });
});

const createFawryPayment = asyncHandler(async (req, res) => {
  const { amount, description = "Healthcare Payment" } = req.body;

  const merchantCode = process.env.FAWRY_MERCHANT_CODE;
  const securityKey = process.env.FAWRY_SECURITY_KEY;

  if (!merchantCode || !securityKey) {
    res.status(500);
    throw new Error("Fawry configuration missing. Set FAWRY_MERCHANT_CODE and FAWRY_SECURITY_KEY.");
  }

  const merchantRef = `HP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, -3);
  const sig = Buffer.from(
    `merchantCode=${merchantCode}&merchantRef=${merchantRef}&amount=${amount}&expiry=${Math.floor(Date.now() / 1000 + 86400)}&description=${description}&currency=EGP&customerMail=${req.user.account.email}&customerMobile=${req.user.account.phone}&sourceName=WEB&successUrl=${process.env.CLIENT_URL}/payments?success=true&cancelUrl=${process.env.CLIENT_URL}/payments?canceled=true&merchantSecurityKey=${securityKey}`
  ).toString("base64");

  try {
    const response = await axios.post(
      `${FAWRY_BASE_URL}/Epayment/SubmitMerchantPayment`,
      {
        merchantCode,
        merchantRef,
        amount,
        expiry: Math.floor(Date.now() / 1000 + 86400),
        description,
        currency: "EGP",
        customerMail: req.user.account.email,
        customerMobile: req.user.account.phone,
        sourceName: "WEB",
        successUrl: `${process.env.CLIENT_URL}/payments?success=true`,
        cancelUrl: `${process.env.CLIENT_URL}/payments?canceled=true`,
        merchantSecurityKey: securityKey,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Signature": sig,
        },
      }
    );

    if (response.data.success && response.data.data) {
      const payment = await Payment.create({
        userId: req.user.id,
        amount,
        method: "fawry",
        status: "pending",
        reference: merchantRef,
        paymentUrl: response.data.data.checkoutUrl,
      });

      res.json({ success: true, payment, paymentUrl: response.data.data.checkoutUrl });
    } else {
      res.status(500);
      throw new Error(response.data.message || "Fawry payment failed");
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message;
    res.status(500);
    throw new Error(`Fawry error: ${errorMessage}`);
  }
});

const createPayment = asyncHandler(async (req, res) => {
  const { amount, method = "cash", description } = req.body;

  if (method === "stripe" && process.env.STRIPE_SECRET_KEY) {
    return createStripePayment(req, res);
  }

  if (method === "fawry" && process.env.FAWRY_MERCHANT_CODE) {
    return createFawryPayment(req, res);
  }

  const payment = await Payment.create({
    userId: req.user.id,
    amount,
    method,
    status: "pending",
    reference: `SIM-${Date.now()}`,
  });

  res.status(201).json({ success: true, payment });
});

const getMyPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = { userId: req.user.id };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [payments, total] = await Promise.all([
    Payment.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Payment.countDocuments(query),
  ]);

  res.json({ success: true, count: payments.length, total, page: Number(page), payments });
});

module.exports = { createPayment, getMyPayments, createStripePayment, createFawryPayment };