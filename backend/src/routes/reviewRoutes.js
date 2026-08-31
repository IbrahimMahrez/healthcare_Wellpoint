const express = require("express");
const { createReview, getReviewsForTarget } = require("../controllers/reviewController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("patient"), createReview);
router.get("/:targetType/:targetId", getReviewsForTarget);

module.exports = router;
