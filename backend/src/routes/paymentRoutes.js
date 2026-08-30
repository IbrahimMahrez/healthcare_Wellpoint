const express = require("express");
const { createPayment, getMyPayments } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", protect, createPayment);
router.get("/my", protect, getMyPayments);

module.exports = router;
