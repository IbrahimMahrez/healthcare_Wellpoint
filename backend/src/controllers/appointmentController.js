const asyncHandler = require("express-async-handler");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const { getIO } = require("../services/socket");
const { cacheDelPattern, cacheGet, cacheSet, CACHE_TTL } = require("../utils/cache");
const { notify } = require("../services/notify");

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isWithinAvailableSlots(datetime, slots) {
  if (!slots || !slots.length) return true;
  const d = new Date(datetime);
  const dayName = DAY_NAMES[d.getDay()];
  const minutesOfDay = d.getHours() * 60 + d.getMinutes();
  return slots.some((slot) => {
    if (slot.day !== dayName || !slot.from || !slot.to) return false;
    const [fh, fm] = slot.from.split(":").map(Number);
    const [th, tm] = slot.to.split(":").map(Number);
    const fromMinutes = fh * 60 + fm;
    const toMinutes = th * 60 + tm;
    return minutesOfDay >= fromMinutes && minutesOfDay < toMinutes;
  });
}

const bookAppointment = asyncHandler(async (req, res) => {
  const { providerId, providerType = "doctor", datetime, consultationType, notes } = req.body;

  if (!datetime || Number.isNaN(new Date(datetime).getTime())) {
    res.status(400);
    throw new Error("A valid datetime is required");
  }

  if (providerType === "doctor") {
    const doctor = await Doctor.findById(providerId);
    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    if (!doctor.availableSlots || doctor.availableSlots.length === 0) {
      res.status(400);
      throw new Error("This doctor hasn't set their available hours yet. Please ask them to set their schedule first.");
    }

    if (!isWithinAvailableSlots(datetime, doctor.availableSlots)) {
      res.status(400);
      throw new Error("This time is outside the doctor's available hours. Please pick a time within their available slots.");
    }
  }

  const clash = await Appointment.exists({
    providerId,
    datetime: new Date(datetime),
    status: { $in: ["pending", "confirmed"] },
  });
  if (clash) {
    res.status(409);
    throw new Error("This time slot was just taken. Please choose another time.");
  }

  const appointment = await Appointment.create({
    patientId: req.user.id,
    providerId,
    providerType,
    datetime,
    consultationType,
    notes,
    status: "pending",
  });

  if (providerType === "doctor") {
    await notify({
      userId: providerId,
      userRole: "doctor",
      type: "appointment_booked",
      title: "New appointment request",
      message: `You have a new appointment request for ${new Date(datetime).toLocaleString()}.`,
      link: `/consultation/${appointment._id}`,
    });

    const io = getIO();
    io.to(`user_${providerId}`).emit("new_appointment", { appointmentId: appointment._id });
  }

  await cacheDelPattern("appointments:my:*");
  res.status(201).json({ success: true, appointment });
});

const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, meetingLink } = req.body;
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  const isOwner =
    appointment.patientId.toString() === req.user.id ||
    appointment.providerId.toString() === req.user.id;

  if (!isOwner) {
    res.status(403);
    throw new Error("Not authorized to update this appointment");
  }

  if (status) appointment.status = status;
  if (meetingLink) appointment.meetingLink = meetingLink;
  await appointment.save();

  if (status === "confirmed" || status === "cancelled") {
    await notify({
      userId: appointment.patientId,
      userRole: "patient",
      type: status === "confirmed" ? "appointment_confirmed" : "appointment_cancelled",
      title: status === "confirmed" ? "Appointment confirmed" : "Appointment cancelled",
      message:
        status === "confirmed"
          ? `Your appointment on ${new Date(appointment.datetime).toLocaleString()} was confirmed. Join the consultation room at the scheduled time.`
          : `Your appointment on ${new Date(appointment.datetime).toLocaleString()} was cancelled.`,
      link: `/consultation/${appointment._id}`,
    });

    const io = getIO();
    io.to(`user_${appointment.patientId}`).emit("appointment_updated", { appointmentId: appointment._id, status });
    io.to(`user_${appointment.providerId}`).emit("appointment_updated", { appointmentId: appointment._id, status });
  }

  if (
    status === "confirmed" &&
    !appointment.sessionStarted &&
    appointment.datetime <= new Date()
  ) {
    appointment.sessionStarted = true;
    appointment.sessionStartedAt = new Date();
    appointment.meetingLink = appointment.meetingLink || `/consultation/${appointment._id}`;
    await appointment.save();
  }

  await cacheDelPattern("appointments:my:*");
  res.json({ success: true, appointment });
});

const getMyAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = req.user.role === "doctor" ? { providerId: req.user.id } : { patientId: req.user.id };
  if (status) query.status = status;

  const cacheKey = `appointments:my:${req.user.id}:${page}:${limit}:${status || ""}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const skip = (Number(page) - 1) * Number(limit);
  const [appointments, total] = await Promise.all([
    Appointment.find(query)
      .populate("patientId", "name email phone")
      .populate("providerId", "name specialty consultationFees")
      .sort({ datetime: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Appointment.countDocuments(query),
  ]);

  const result = { success: true, count: appointments.length, total, page: Number(page), appointments };
  await cacheSet(cacheKey, result, CACHE_TTL.SHORT);
  res.json(result);
});

const getAppointmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const appointment = await Appointment.findById(id)
    .populate("patientId", "name email phone")
    .populate("providerId", "name specialty consultationFees rating numReviews");
  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }
  const isPatient = appointment.patientId?._id.toString() === req.user.id;
  const isProvider = appointment.providerId?._id.toString() === req.user.id;
  if (!isPatient && !isProvider) {
    res.status(403);
    throw new Error("You are not authorized to view this appointment");
  }
  res.json({ success: true, appointment });
});

module.exports = { bookAppointment, updateAppointmentStatus, getMyAppointments, getAppointmentById };