const asyncHandler = require("express-async-handler");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const TestResult = require("../models/TestResult");
const Radiology = require("../models/Radiology");
const MedicalCase = require("../models/MedicalCase");
const { cacheGet, cacheSet, cacheDel, CACHE_TTL } = require("../utils/cache");

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

const searchDoctors = asyncHandler(async (req, res) => {
  const { specialty, city, minRating, maxFee, sort, page = 1, limit = 10 } = req.query;

  const cacheKey = `doctors:search:${specialty || ""}:${city || ""}:${minRating || ""}:${maxFee || ""}:${sort || ""}:${page}:${limit}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return res.json(cached);

  const filter = {};
  if (specialty) filter.specialty = new RegExp(specialty, "i");
  if (city) filter["clinicAddresses.city"] = new RegExp(city, "i");
  if (minRating) filter.rating = { $gte: Number(minRating) };
  if (maxFee) filter.consultationFees = { ...(filter.consultationFees || {}), $lte: Number(maxFee) };

  const SORTS = {
    rating: { rating: -1 },
    price_asc: { consultationFees: 1 },
    price_desc: { consultationFees: -1 },
    reviews: { numReviews: -1 },
  };
  const sortBy = SORTS[sort] || SORTS.rating;

  const skip = (Number(page) - 1) * Number(limit);
  const [doctors, total] = await Promise.all([
    Doctor.find(filter).sort(sortBy).skip(skip).limit(Number(limit)),
    Doctor.countDocuments(filter),
  ]);

  const result = { success: true, count: doctors.length, total, page: Number(page), doctors };
  await cacheSet(cacheKey, result, CACHE_TTL.MEDIUM);
  res.json(result);
});

const getDoctorById = asyncHandler(async (req, res) => {
  const cacheKey = `doctor:${req.params.id}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return res.json(cached);

  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  const result = { success: true, doctor };
  await cacheSet(cacheKey, result, CACHE_TTL.LONG);
  res.json(result);
});

const getMe = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.user.id);
  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }
  res.json({ success: true, doctor });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const allowed = ["name", "phone", "bio", "qualifications", "clinicAddresses", "availableSlots", "consultationFees", "avatarUrl"];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const doctor = await Doctor.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
  await cacheDel(`doctor:${req.user.id}`);
  await cacheDelPattern("doctors:search:*");
  res.json({ success: true, doctor });
});

const updateMySlots = asyncHandler(async (req, res) => {
  const { availableSlots } = req.body;

  if (!Array.isArray(availableSlots)) {
    res.status(400);
    throw new Error("availableSlots must be an array");
  }

  const validDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (const slot of availableSlots) {
    if (!validDays.includes(slot.day)) {
      res.status(400);
      throw new Error(`Invalid day: ${slot.day}. Must be one of: ${validDays.join(", ")}`);
    }
    if (!slot.from || !slot.to) {
      res.status(400);
      throw new Error("Each slot must have 'from' and 'to' times");
    }
    const [fh, fm] = slot.from.split(":").map(Number);
    const [th, tm] = slot.to.split(":").map(Number);
    if (isNaN(fh) || isNaN(fm) || isNaN(th) || isNaN(tm)) {
      res.status(400);
      throw new Error("Time format must be HH:MM");
    }
  }

  const doctor = await Doctor.findByIdAndUpdate(
    req.user.id,
    { availableSlots },
    { new: true, runValidators: true }
  );

  await cacheDel(`doctor:${req.user.id}`);
  await cacheDelPattern("doctors:search:*");

  res.json({ success: true, doctor, message: "Available slots updated successfully" });
});

const getMyPatients = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const appointments = await Appointment.find({ providerId: req.user.id })
    .populate("patientId", "name email phone")
    .sort({ datetime: -1 })
    .skip(skip)
    .limit(Number(limit));

  const byPatient = new Map();
  for (const appt of appointments) {
    if (!appt.patientId) continue;
    const pid = appt.patientId._id.toString();
    if (!byPatient.has(pid)) {
      byPatient.set(pid, {
        patient: appt.patientId,
        lastAppointment: appt.datetime,
        lastStatus: appt.status,
        appointmentCount: 0,
      });
    }
    byPatient.get(pid).appointmentCount += 1;
  }

  const patients = Array.from(byPatient.values()).sort(
    (a, b) => new Date(b.lastAppointment) - new Date(a.lastAppointment)
  );

  res.json({ success: true, count: patients.length, patients });
});

const getPatientDetail = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const appointments = await Appointment.find({ providerId: req.user.id, patientId }).sort({ datetime: -1 });
  if (!appointments.length) {
    res.status(403);
    throw new Error("You don't have any appointment history with this patient");
  }

  const [prescriptions, tests, scans, cases] = await Promise.all([
    Prescription.find({ doctorId: req.user.id, patientId }).sort({ createdAt: -1 }),
    TestResult.find({ doctorId: req.user.id, patientId }).populate("labId", "name").sort({ createdAt: -1 }),
    Radiology.find({ doctorId: req.user.id, patientId }).populate("labId", "name").sort({ createdAt: -1 }),
    MedicalCase.find({ doctorId: req.user.id, patientId }).sort({ createdAt: -1 }),
  ]);

  res.json({ success: true, appointments, prescriptions, tests, scans, cases });
});

module.exports = { searchDoctors, getDoctorById, getMe, updateMyProfile, updateMySlots, getMyPatients, getPatientDetail };