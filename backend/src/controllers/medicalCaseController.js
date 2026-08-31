const asyncHandler = require("express-async-handler");
const MedicalCase = require("../models/MedicalCase");
const notify = require("../services/notify");
const { assertDoctorTreatsPatient } = require("../utils/ownership");

// @desc   Doctor marks an affected body part with a diagnosis + treatment plan
// @route  POST /api/medical-cases
// @access Private (doctor)
const createCase = asyncHandler(async (req, res) => {
  const { patientId, appointmentId, bodyPartKey, bodyPartLabel, view, diagnosis, treatmentPlan, severity } = req.body;

  if (!patientId || !bodyPartKey || !bodyPartLabel || !diagnosis || !treatmentPlan) {
    res.status(400);
    throw new Error("patientId, bodyPartKey, bodyPartLabel, diagnosis and treatmentPlan are required");
  }

  await assertDoctorTreatsPatient(res, req.user.id, patientId);

  const medicalCase = await MedicalCase.create({
    patientId,
    doctorId: req.user.id,
    appointmentId,
    bodyPartKey,
    bodyPartLabel,
    view: view === "back" ? "back" : "front",
    diagnosis,
    treatmentPlan,
    severity,
  });

  await notify({
    userId: patientId,
    userRole: "patient",
    type: "system",
    title: "Your doctor added a diagnosis",
    message: `Dr. ${req.user.account?.name || ""} marked "${bodyPartLabel}" with a diagnosis and treatment plan.`,
    link: "/health-status",
  });

  res.status(201).json({ success: true, case: medicalCase });
});

// @desc   Get the cases this doctor has logged for one patient
// @route  GET /api/medical-cases/patient/:patientId
// @access Private (doctor)
const getCasesForPatient = asyncHandler(async (req, res) => {
  await assertDoctorTreatsPatient(res, req.user.id, req.params.patientId);
  const cases = await MedicalCase.find({ doctorId: req.user.id, patientId: req.params.patientId }).sort({ createdAt: -1 });
  res.json({ success: true, cases });
});

// @desc   Get every case logged for the logged-in patient, across all doctors
// @route  GET /api/medical-cases/my
// @access Private (patient)
const getMyCases = asyncHandler(async (req, res) => {
  const cases = await MedicalCase.find({ patientId: req.user.id })
    .populate("doctorId", "name specialty")
    .sort({ createdAt: -1 });
  res.json({ success: true, cases });
});

// @desc   Doctor marks a case resolved/active
// @route  PATCH /api/medical-cases/:id
// @access Private (doctor)
const updateCaseStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["active", "resolved"].includes(status)) {
    res.status(400);
    throw new Error("status must be 'active' or 'resolved'");
  }

  const medicalCase = await MedicalCase.findOne({ _id: req.params.id, doctorId: req.user.id });
  if (!medicalCase) {
    res.status(404);
    throw new Error("Case not found");
  }

  medicalCase.status = status;
  await medicalCase.save();
  res.json({ success: true, case: medicalCase });
});

module.exports = { createCase, getCasesForPatient, getMyCases, updateCaseStatus };
