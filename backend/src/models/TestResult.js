const mongoose = require("mongoose");

const testResultSchema = new mongoose.Schema(
  {
    testName: { type: String, required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    labId: { type: mongoose.Schema.Types.ObjectId, ref: "Lab", required: true },
    resultsFileUrl: String,
    numericResults: [{ label: String, value: String, unit: String, normalRange: String }],
    interpretationNotes: String,
    status: { type: String, enum: ["requested", "processing", "completed"], default: "requested" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestResult", testResultSchema);
