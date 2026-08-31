const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bloodType: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""], default: "" },
    heightCm: Number,
    weightKg: Number,
    bloodPressure: { systolic: Number, diastolic: Number },
    heartRateBpm: Number,
    glucoseLevelMgDl: Number,
    oxygenSaturation: Number,
    allergies: [String],
    chronicConditions: [String],
    currentMedications: [String],
    overallStatus: {
      type: String,
      enum: ["excellent", "good", "fair", "needs-attention", "critical"],
      default: "good",
    },
    doctorNotes: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    lastCheckupDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("HealthRecord", healthRecordSchema);
