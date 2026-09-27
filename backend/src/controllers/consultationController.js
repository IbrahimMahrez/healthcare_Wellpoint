const asyncHandler = require("express-async-handler");
const Appointment = require("../models/Appointment");
const Message = require("../models/Message");
const Signal = require("../models/Signal");
const { getIO } = require("../services/socket");
const { cacheDelPattern, cacheDel } = require("../utils/cache");
const { notify } = require("../services/notify");
const { uploadSingle } = require("../middleware/upload");

async function loadAsParticipant(req, res) {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  const isPatient = appointment.patientId.toString() === req.user.id;
  const isProvider = appointment.providerId.toString() === req.user.id;

  if (!isPatient && !isProvider) {
    res.status(403);
    throw new Error("Not authorized for this consultation");
  }

  return { appointment, myRole: isPatient ? "patient" : "doctor" };
}

const getRoom = asyncHandler(async (req, res) => {
  const { appointment, myRole } = await loadAsParticipant(req, res);

  if (
    appointment.status === "confirmed" &&
    !appointment.sessionStarted &&
    appointment.datetime <= new Date()
  ) {
    appointment.sessionStarted = true;
    appointment.sessionStartedAt = new Date();
    if (!appointment.meetingLink) appointment.meetingLink = `/consultation/${appointment._id}`;
    await appointment.save();
  }

  if (appointment.status !== "confirmed" && appointment.status !== "completed") {
    res.status(400);
    throw new Error("This appointment isn't confirmed, so there is no active consultation room");
  }

  res.json({ success: true, appointment, myRole, canJoin: appointment.status === "confirmed" });
});

const getMessages = asyncHandler(async (req, res) => {
  const { appointment } = await loadAsParticipant(req, res);
  const { page = 1, limit = 50 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const messages = await Message.find({ appointmentId: appointment._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("sender", "name avatarUrl");

  res.json({ success: true, messages: messages.reverse() });
});

const sendMessage = asyncHandler(async (req, res) => {
  const { appointment, myRole } = await loadAsParticipant(req, res);
  const { text } = req.body;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error("Message text is required");
  }

  const message = await Message.create({
    appointmentId: appointment._id,
    room: `consultation_${appointment._id}`,
    sender: req.user.id,
    senderId: req.user.id,
    role: myRole,
    content: text.trim(),
    text: text.trim(),
  });

  const populated = await message.populate("sender", "name avatarUrl");

  const io = getIO();
  io.to(`room_${appointment._id}`).emit("new_message", populated);

  await cacheDelPattern(`messages:${appointment._id}:*`);
  res.status(201).json({ success: true, message: populated });
});

const uploadFiles = asyncHandler(async (req, res) => {
  const { appointment } = await loadAsParticipant(req, res);

  if (!req.files || !req.files.length) {
    res.status(400);
    throw new Error("No files uploaded");
  }

  const urls = req.files.map((f) => f.path);

  const message = await Message.create({
    appointmentId: appointment._id,
    room: `consultation_${appointment._id}`,
    sender: req.user.id,
    senderId: req.user.id,
    role: "system",
    content: `📎 ${urls.length} file(s) uploaded`,
    text: `📎 ${urls.length} file(s) uploaded`,
    files: urls,
  });

  const populated = await message.populate("sender", "name avatarUrl");

  const io = getIO();
  io.to(`room_${appointment._id}`).emit("new_message", populated);

  await cacheDelPattern(`messages:${appointment._id}:*`);
  res.status(201).json({ success: true, message: populated, urls });
});

const getSignals = asyncHandler(async (req, res) => {
  const { appointment, myRole } = await loadAsParticipant(req, res);
  const otherRole = myRole === "patient" ? "doctor" : "patient";
  const since = req.query.since ? new Date(req.query.since) : new Date(0);

  const signals = await Signal.find({
    appointmentId: appointment._id,
    fromRole: otherRole,
    createdAt: { $gt: since },
  }).sort({ createdAt: 1 });

  res.json({ success: true, signals, serverTime: new Date() });
});

const sendSignal = asyncHandler(async (req, res) => {
  const { appointment, myRole } = await loadAsParticipant(req, res);
  const { kind, payload } = req.body;

  if (!["offer", "answer", "candidate", "hangup"].includes(kind)) {
    res.status(400);
    throw new Error("Invalid signal kind");
  }

  const signal = await Signal.create({
    appointmentId: appointment._id,
    fromRole: myRole,
    kind,
    payload,
  });

  if (kind === "offer") {
    const otherUserId = myRole === "patient" ? appointment.providerId : appointment.patientId;
    const otherRole = myRole === "patient" ? "doctor" : "patient";
    await notify({
      userId: otherUserId,
      userRole: otherRole,
      type: "appointment_started",
      title: "Incoming call",
      message: "The other participant is calling you now.",
      link: `/consultation/${appointment._id}`,
    });
  }

  res.status(201).json({ success: true, signal });
});

module.exports = { getRoom, getMessages, sendMessage, uploadFiles, getSignals, sendSignal };