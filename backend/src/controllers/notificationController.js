const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification");

// @desc   Get my notifications (most recent first)
// @route  GET /api/notifications/my
// @access Private
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50);
  const unreadCount = await Notification.countDocuments({ userId: req.user.id, read: false });
  res.json({ success: true, notifications, unreadCount });
});

// @desc   Mark one notification as read
// @route  PATCH /api/notifications/:id/read
// @access Private
const markAsRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { read: true },
    { new: true }
  );
  if (!n) {
    res.status(404);
    throw new Error("Notification not found");
  }
  res.json({ success: true, notification: n });
});

// @desc   Mark all my notifications as read
// @route  PATCH /api/notifications/read-all
// @access Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
  res.json({ success: true });
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
