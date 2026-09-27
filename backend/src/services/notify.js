const Notification = require("../models/Notification");
const { getIO } = require("./socket");

let fcmInitialized = false;
let fcm = null;

try {
  if (process.env.FCM_SERVER_KEY) {
    fcm = require("fcm-node");
    fcmInitialized = true;
  }
} catch (_) {
  fcmInitialized = false;
}

const sendFCM = async (token, title, body) => {
  if (!fcmInitialized || !token) return;
  try {
    const sender = new fcm(process.env.FCM_SERVER_KEY);
    const message = {
      to: token,
      notification: { title, body },
      priority: "high",
    };
    await sender.send(message);
  } catch (err) {
    console.error("FCM send error:", err.message);
  }
};

const notify = async ({ userId, userRole, type, title, message, link }) => {
  try {
    await Notification.create({ userId, userRole, type, title, message, link });

    try {
      const io = getIO();
      io.to(`user_${userId}`).emit("new_notification", { type, title, message, link });
    } catch (_) {}
  } catch (err) {
    console.error("notify() failed:", err.message);
  }
};

const notifyPush = async (userToken, title, body) => {
  await sendFCM(userToken, title, body);
};

module.exports = { notify, notifyPush, sendFCM };