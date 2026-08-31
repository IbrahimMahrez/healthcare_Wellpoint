const asyncHandler = require("express-async-handler");
const AdmissionPermit = require("../models/AdmissionPermit");

// @desc   Get my entry/exit (admission & discharge) permits and case details
// @route  GET /api/admissions/my
// @access Private (patient)
const getMyPermits = asyncHandler(async (req, res) => {
  const permits = await AdmissionPermit.find({ patientId: req.user.id })
    .populate("doctorId", "name specialty")
    .sort({ createdAt: -1 });
  res.json({ success: true, permits });
});

module.exports = { getMyPermits };
