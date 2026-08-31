const asyncHandler = require("express-async-handler");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const notify = require("../services/notify");

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Checks whether `datetime` falls inside one of the doctor's declared weekly
// available slots (day + from/to time-of-day, e.g. { day: "Mon", from: "09:00", to: "17:00" }).
function isWithinAvailableSlots(datetime, slots) {
  if (!slots || !slots.length) return true; // doctor hasn't set any slots yet — don't block booking
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

// @desc   Book an appointment
// @route  POST /api/appointments
// @access Private (patient)
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

    if (!isWithinAvailableSlots(datetime, doctor.availableSlots)) {
      res.status(400);
      throw new Error("This time is outside the doctor's available hours. Please pick a time within their available slots.");
    }
  }

  // Prevent two patients from booking the exact same slot with the same provider.
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
      link: "/doctor-dashboard",
    });
  }

  res.status(201).json({ success: true, appointment });
});

// @desc   Update appointment status (confirm/cancel/complete)
// @route  PATCH /api/appointments/:id
// @access Private (doctor or patient - restricted by ownership)
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
          ? `Your appointment on ${new Date(appointment.datetime).toLocaleString()} was confirmed. The chat/video room will open automatically at that time.`
          : `Your appointment on ${new Date(appointment.datetime).toLocaleString()} was cancelled.`,
      link: "/dashboard",
    });
  }

  // If a doctor completes an appointment, or re-confirms one whose time has
  // already passed, there's no need to make the scheduler wait for its next
  // tick — just open the room right away so nobody is stuck.
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

  res.json({ success: true, appointment });
});

// @desc   List my appointments (as patient or provider)
// @route  GET /api/appointments/my
// @access Private
const getMyAppointments = asyncHandler(async (req, res) => {
  const query =
    req.user.role === "doctor"
      ? { providerId: req.user.id }
      : { patientId: req.user.id };

  const appointments = await Appointment.find(query)
    .populate("patientId", "name email phone")
    .populate("providerId", "name specialty consultationFees")
    .sort({ datetime: -1 });

  res.json({ success: true, count: appointments.length, appointments });
});

module.exports = { bookAppointment, updateAppointmentStatus, getMyAppointments };
