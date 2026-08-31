const asyncHandler = require("express-async-handler");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const TestResult = require("../models/TestResult");
const Radiology = require("../models/Radiology");
const MedicalCase = require("../models/MedicalCase");

// @desc   Search doctors by specialty, city, rating, price, availability
// @route  GET /api/doctors
// @access Public
const searchDoctors = asyncHandler(async (req, res) => {
  const { specialty, city, minRating, maxFee, sort, page = 1, limit = 10 } = req.query;

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

  res.json({ success: true, count: doctors.length, total, page: Number(page), doctors });
});

// @desc   Get doctor details
// @route  GET /api/doctors/:id
// @access Public
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }
  res.json({ success: true, doctor });
});

// @desc   Update own doctor profile
// @route  PUT /api/doctors/me
// @access Private (doctor)
const updateMyProfile = asyncHandler(async (req, res) => {
  const allowed = ["name", "phone", "bio", "qualifications", "clinicAddresses", "availableSlots", "consultationFees", "avatarUrl"];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const doctor = await Doctor.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
  res.json({ success: true, doctor });
});

// @desc   Get every distinct patient this doctor has an appointment with,
//         each with a quick summary — the "patient list" doctors previously
//         had no way to see (they could only see individual appointments).
// @route  GET /api/doctors/my-patients
// @access Private (doctor)
const getMyPatients = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ providerId: req.user.id })
    .populate("patientId", "name email phone")
    .sort({ datetime: -1 });

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

// @desc   Get one patient's full record as seen by this doctor: shared
//         appointments, prescriptions this doctor issued them, and any
//         tests/scans this doctor ordered for them.
// @route  GET /api/doctors/patients/:patientId
// @access Private (doctor) — only if the doctor has at least one appointment
//         with this patient, so a doctor can't browse arbitrary patients.
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

module.exports = { searchDoctors, getDoctorById, updateMyProfile, getMyPatients, getPatientDetail };
