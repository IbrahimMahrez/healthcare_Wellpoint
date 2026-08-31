const mongoose = require("mongoose");

const medicalCaseSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    // Which body diagram region was clicked, e.g. "chest", "leftKnee" — must
    // match a key the frontend's BodyDiagram component knows how to render.
    bodyPartKey: { type: String, required: true },
    bodyPartLabel: { type: String, required: true }, // human-readable, e.g. "Chest"
    view: { type: String, enum: ["front", "back"], default: "front" },
    diagnosis: { type: String, required: true, trim: true }, // the doctor's explanation of what's wrong
    treatmentPlan: { type: String, required: true, trim: true }, // the doctor's solution/plan
    severity: { type: String, enum: ["mild", "moderate", "severe"], default: "moderate" },
    status: { type: String, enum: ["active", "resolved"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalCase", medicalCaseSchema);
