const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Lab = require("../models/Lab");
const Pharmacy = require("../models/Pharmacy");
const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const Review = require("../models/Review");
const Prescription = require("../models/Prescription");

// @desc   Platform-wide stats for the admin overview
// @route  GET /api/admin/stats
// @access Private (admin)
const getStats = asyncHandler(async (req, res) => {
  const [
    totalPatients,
    totalDoctors,
    verifiedDoctors,
    pendingDoctors,
    totalLabs,
    totalPharmacies,
    totalAppointments,
    appointmentsByStatus,
    totalPayments,
    revenueAgg,
    totalReviews,
    totalPrescriptions,
    recentAppointments,
  ] = await Promise.all([
    User.countDocuments({ role: { $in: ["patient", undefined] } }),
    Doctor.countDocuments(),
    Doctor.countDocuments({ verified: true }),
    Doctor.countDocuments({ verified: false }),
    Lab.countDocuments(),
    Pharmacy.countDocuments(),
    Appointment.countDocuments(),
    Appointment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Payment.countDocuments(),
    Payment.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Review.countDocuments(),
    Prescription.countDocuments(),
    Appointment.find().sort({ createdAt: -1 }).limit(5).populate("patientId", "name").populate("providerId", "name specialty"),
  ]);

  const statusMap = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  appointmentsByStatus.forEach((s) => { statusMap[s._id] = s.count; });

  res.json({
    success: true,
    stats: {
      totalPatients,
      totalDoctors,
      verifiedDoctors,
      pendingDoctors,
      totalLabs,
      totalPharmacies,
      totalAppointments,
      appointmentsByStatus: statusMap,
      totalPayments,
      totalRevenue: revenueAgg[0]?.total || 0,
      totalReviews,
      totalPrescriptions,
    },
    recentAppointments,
  });
});

// @desc   List all doctors (with verification status) for admin review
// @route  GET /api/admin/doctors
// @access Private (admin)
const getAllDoctors = asyncHandler(async (req, res) => {
  const { status } = req.query; // "pending" | "verified" | undefined (all)
  const filter = {};
  if (status === "pending") filter.verified = false;
  if (status === "verified") filter.verified = true;
  const doctors = await Doctor.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: doctors.length, doctors });
});

// @desc   Verify or unverify a doctor
// @route  PATCH /api/admin/doctors/:id/verify
// @access Private (admin)
const setDoctorVerification = asyncHandler(async (req, res) => {
  const { verified } = req.body;
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, { verified: !!verified }, { new: true });
  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }
  res.json({ success: true, doctor });
});

// @desc   List all patients
// @route  GET /api/admin/patients
// @access Private (admin)
const getAllPatients = asyncHandler(async (req, res) => {
  const patients = await User.find({ role: { $in: ["patient", undefined] } }).sort({ createdAt: -1 });
  res.json({ success: true, count: patients.length, patients });
});

// @desc   List all appointments across the platform
// @route  GET /api/admin/appointments
// @access Private (admin)
const getAllAppointments = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const appointments = await Appointment.find(filter)
    .populate("patientId", "name email")
    .populate("providerId", "name specialty")
    .sort({ datetime: -1 })
    .limit(200);
  res.json({ success: true, count: appointments.length, appointments });
});

// @desc   List all payments across the platform
// @route  GET /api/admin/payments
// @access Private (admin)
const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find().populate("userId", "name email").sort({ createdAt: -1 }).limit(200);
  res.json({ success: true, count: payments.length, payments });
});

// @desc   List labs & pharmacies for admin oversight
// @route  GET /api/admin/providers
// @access Private (admin)
const getAllProviders = asyncHandler(async (req, res) => {
  const [labs, pharmacies] = await Promise.all([Lab.find().sort({ createdAt: -1 }), Pharmacy.find().sort({ createdAt: -1 })]);
  res.json({ success: true, labs, pharmacies });
});

// @desc   Suspend/reactivate any account (soft-disable via isVerified flag reuse)
// @route  PATCH /api/admin/users/:role/:id/status
// @access Private (admin)
const MODEL_BY_ROLE = { patient: User, doctor: Doctor, lab: Lab, pharmacy: Pharmacy };
const setAccountStatus = asyncHandler(async (req, res) => {
  const { role, id } = req.params;
  const { verified } = req.body;
  const Model = MODEL_BY_ROLE[role];
  if (!Model) {
    res.status(400);
    throw new Error("Invalid role");
  }
  const field = role === "doctor" ? "verified" : "isVerified";
  const doc = await Model.findByIdAndUpdate(id, { [field]: !!verified }, { new: true });
  if (!doc) {
    res.status(404);
    throw new Error("Account not found");
  }
  res.json({ success: true, account: doc });
});

module.exports = {
  getStats,
  getAllDoctors,
  setDoctorVerification,
  getAllPatients,
  getAllAppointments,
  getAllPayments,
  getAllProviders,
  setAccountStatus,
};
