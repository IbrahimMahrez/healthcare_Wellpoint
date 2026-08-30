const Notification = require("../models/Notification");

// Central helper to create a notification. Never throws — a failed notification
// should never break the primary action (booking, status update, etc).
const notify = async ({ userId, userRole, type, title, message, link }) => {
  try {
    await Notification.create({ userId, userRole, type, title, message, link });
  } catch (err) {
    console.error("notify() failed:", err.message);
  }
};

module.exports = notify;
