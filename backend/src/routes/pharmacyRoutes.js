const express = require("express");
const { searchPharmacies, getMyOrders, updateOrderStatus } = require("../controllers/pharmacyController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/search", searchPharmacies);
router.get("/orders", protect, authorize("pharmacy"), getMyOrders);
router.patch("/orders/:id", protect, authorize("pharmacy"), updateOrderStatus);

module.exports = router;
