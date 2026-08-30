const asyncHandler = require("express-async-handler");
const Radiology = require("../models/Radiology");

// @desc   Request an imaging/radiology scan
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

// @desc   Get my radiology / imaging results
// @route  GET /api/radiology/my
// @access Private (patient)
const getMyScans = asyncHandler(async (req, res) => {
  const scans = await Radiology.find({ patientId: req.user.id })
    .populate("labId", "name")
    .sort({ createdAt: -1 });
  res.json({ success: true, scans });
});

module.exports = { requestScan, getMyScans };
