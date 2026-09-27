const { Server } = require("socket.io");

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL?.replace(/\/$/, "") || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    try {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.user.id} (${socket.user.role})`);

    socket.join(`user_${socket.user.id}`);

    socket.on("join_room", (room) => {
      socket.join(room);
    });

    socket.on("send_message", async (data) => {
      const { room, message } = data;
      try {
        const Message = require("../models/Message");
        const msg = await Message.create({
          room,
          sender: socket.user.id,
          senderId: socket.user.id,
          role: socket.user.role,
          content: message,
        });
        const populated = await msg.populate("sender", "name avatarUrl");
        io.to(room).emit("receive_message", populated);
      } catch (err) {
        console.error("Socket send_message error:", err.message);
      }
    });

    socket.on("typing", (data) => {
      const { room, userId } = data;
      socket.to(room).emit("typing", { userId, room });
    });

    socket.on("stop_typing", (data) => {
      const { room, userId } = data;
      socket.to(room).emit("stop_typing", { userId, room });
    });

    socket.on("notification", async (data) => {
      const { userId, title, message, link, type } = data;
      try {
        const Notification = require("../models/Notification");
        await Notification.create({
          userId,
          userRole: socket.user.role,
          type: type || "system",
          title,
          message,
          link,
        });
        io.to(`user_${userId}`).emit("new_notification", { title, message, link });
      } catch (err) {
        console.error("Socket notification error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.user.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocket(server) first.");
  }
  return io;
};

module.exports = { initSocket, getIO };