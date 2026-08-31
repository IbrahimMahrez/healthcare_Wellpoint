const express = require("express");
const { getMyNotifications, markAsRead, markAllAsRead } = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my", protect, getMyNotifications);
router.patch("/read-all", protect, markAllAsRead);
router.patch("/:id/read", protect, markAsRead);

module.exports = router;
