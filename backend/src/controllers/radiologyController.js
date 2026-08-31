const asyncHandler = require("express-async-handler");
const Radiology = require("../models/Radiology");
const notify = require("../services/notify");
const { assertDoctorTreatsPatient } = require("../utils/ownership");

// @desc   Request an imaging/radiology scan (self-request)
// @route  POST /api/radiology
// @access Private (patient)
const requestScan = asyncHandler(async (req, res) => {
  const { scanType, bodyPart, facilityName, scheduledDate, priority } = req.body;
  const scan = await Radiology.create({
    scanType,
    bodyPart,
    facilityName,
    scheduledDate,
    priority,
    patientId: req.user.id,
  });
  res.status(201).json({ success: true, scan });
});

// @desc   Doctor requests an imaging/radiology scan for one of their patients
// @route  POST /api/radiology/request-for-patient
// @access Private (doctor)
const requestScanForPatient = asyncHandler(async (req, res) => {
  const { patientId, scanType, bodyPart, facilityName, scheduledDate, priority, labId } = req.body;

  if (!patientId || !scanType || !bodyPart) {
    res.status(400);
    throw new Error("patientId, scanType and bodyPart are required");
  }

  await assertDoctorTreatsPatient(res, req.user.id, patientId);

  const scan = await Radiology.create({
    patientId,
    doctorId: req.user.id,
    labId,
    scanType,
    bodyPart,
    facilityName,
    scheduledDate,
    priority,
  });

  if (labId) {
    await notify({
      userId: labId,
      userRole: "lab",
      type: "system",
      title: "New imaging request from a doctor",
      message: `Dr. ${req.user.account?.name || ""} requested a ${scanType} (${bodyPart}) for a patient.`,
      link: "/lab-dashboard",
    });
  }

  await notify({
    userId: patientId,
    userRole: "patient",
    type: "system",
    title: "Your doctor requested an imaging scan",
    message: `Your doctor requested a ${scanType} (${bodyPart}).`,
    link: "/radiology",
  });

  res.status(201).json({ success: true, scan });
});

// @desc   Get my radiology / imaging results
// @route  GET /api/radiology/my
// @access Private (patient)
const getMyScans = asyncHandler(async (req, res) => {
  const scans = await Radiology.find({ patientId: req.user.id })
    .populate("labId", "name")
    .sort({ createdAt: -1 });
  res.json({ success: true, scans });
});

// @desc   Get scans assigned to the logged-in lab
// @route  GET /api/radiology/lab-queue
// @access Private (lab)
const getLabQueue = asyncHandler(async (req, res) => {
  const scans = await Radiology.find({ labId: req.user.id })
    .populate("patientId", "name phone")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: scans.length, scans });
});

// @desc   Lab enters/uploads the report for a scan it owns
// @route  PATCH /api/radiology/:id/report
// @access Private (lab)
const uploadReport = asyncHandler(async (req, res) => {
  const { imageUrl, reportFileUrl, findings, radiologistName, status } = req.body;

  const scan = await Radiology.findOne({ _id: req.params.id, labId: req.user.id });
  if (!scan) {
    res.status(404);
    throw new Error("Scan not found for this lab");
  }

  if (imageUrl !== undefined) scan.imageUrl = imageUrl;
  if (reportFileUrl !== undefined) scan.reportFileUrl = reportFileUrl;
  if (findings !== undefined) scan.findings = findings;
  if (radiologistName !== undefined) scan.radiologistName = radiologistName;
  scan.status = status && ["scheduled", "in-progress", "completed", "cancelled"].includes(status) ? status : "completed";
  await scan.save();

  if (scan.status === "completed") {
    await notify({
      userId: scan.patientId,
      userRole: "patient",
      type: "test_ready",
      title: "Imaging results ready",
      message: `Your ${scan.scanType} (${scan.bodyPart}) results are ready.`,
      link: "/radiology",
    });
  }

  res.json({ success: true, scan });
});

module.exports = { requestScan, requestScanForPatient, getMyScans, getLabQueue, uploadReport };
