const asyncHandler = require("express-async-handler");
const Appointment = require("../models/Appointment");
const Message = require("../models/Message");
const Signal = require("../models/Signal");
const notify = require("../services/notify");

// Shared guard: loads the appointment and makes sure the logged-in account
// (patient or doctor) is actually a participant. Returns { appointment, myRole }.
// Follows this codebase's convention of setting res.status() before throwing,
// since errorMiddleware reads the status off the response, not the error.
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

// @desc   Get consultation room info (also lazily starts the session if the
//         scheduler hasn't ticked yet but the appointment time has passed —
//         so opening the link never shows a dead room).
// @route  GET /api/consultations/:id
// @access Private (patient or doctor on the appointment)
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

  res.json({
    success: true,
    appointment,
    myRole,
    canJoin: appointment.status === "confirmed",
  });
});

// @desc   Get chat history for an appointment
// @route  GET /api/consultations/:id/messages
// @access Private (patient or doctor on the appointment)
const getMessages = asyncHandler(async (req, res) => {
  const { appointment } = await loadAsParticipant(req, res);
  const messages = await Message.find({ appointmentId: appointment._id }).sort({ createdAt: 1 }).limit(500);
  res.json({ success: true, messages });
});

// @desc   Send a chat message
// @route  POST /api/consultations/:id/messages
// @access Private (patient or doctor on the appointment)
const sendMessage = asyncHandler(async (req, res) => {
  const { appointment, myRole } = await loadAsParticipant(req, res);
  const { text } = req.body;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error("Message text is required");
  }

  const message = await Message.create({
    appointmentId: appointment._id,
    senderId: req.user.id,
    senderRole: myRole,
    text: text.trim(),
  });

  // Notify the other participant only for the very first message of a batch
  // isn't tracked here to keep this simple/cheap — the in-app bell + the
  // consultation page's own polling are enough for an active call.

  res.status(201).json({ success: true, message });
});

// @desc   Poll for WebRTC signaling messages sent by the other participant
// @route  GET /api/consultations/:id/signals?since=<ISO timestamp>
// @access Private (patient or doctor on the appointment)
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

// @desc   Push a WebRTC signaling message (offer/answer/candidate/hangup)
// @route  POST /api/consultations/:id/signals
// @access Private (patient or doctor on the appointment)
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

  // First offer of a call: nudge the other side with a notification in case
  // they aren't already sitting on the consultation page.
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

module.exports = { getRoom, getMessages, sendMessage, getSignals, sendSignal };
