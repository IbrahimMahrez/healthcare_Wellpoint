const asyncHandler = require("express-async-handler");
const HealthRecord = require("../models/HealthRecord");

// @desc   Get my health status / vitals record
// @route  GET /api/health-records/my
// @access Private (patient)
const getMyHealthRecord = asyncHandler(async (req, res) => {
  const record = await HealthRecord.findOne({ patientId: req.user.id }).populate("updatedBy", "name specialty");
  res.json({ success: true, record: record || null });
});

// @desc   Update / create my health status (patient self-reported vitals)
// @route  PUT /api/health-records/my
// @access Private (patient)
const upsertMyHealthRecord = asyncHandler(async (req, res) => {
  const allowedFields = [
    "bloodType",
    "heightCm",
    "weightKg",
    "bloodPressure",
    "heartRateBpm",
    "glucoseLevelMgDl",
    "oxygenSaturation",
    "allergies",
    "chronicConditions",
    "currentMedications",
  ];
  const update = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) update[f] = req.body[f];
  });

  const record = await HealthRecord.findOneAndUpdate(
    { patientId: req.user.id },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, record });
});

module.exports = { getMyHealthRecord, upsertMyHealthRecord };
