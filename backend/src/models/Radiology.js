const mongoose = require("mongoose");

const radiologySchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    labId: { type: mongoose.Schema.Types.ObjectId, ref: "Lab" },
    scanType: {
      type: String,
      enum: ["X-Ray", "MRI", "CT Scan", "Ultrasound", "Mammography", "PET Scan"],
      required: true,
    },
    bodyPart: { type: String, required: true },
    facilityName: String,
    scheduledDate: Date,
    imageUrl: String,
    reportFileUrl: String,
    findings: String,
    radiologistName: String,
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "cancelled"],
      default: "scheduled",
    },
    priority: { type: String, enum: ["routine", "urgent"], default: "routine" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Radiology", radiologySchema);
