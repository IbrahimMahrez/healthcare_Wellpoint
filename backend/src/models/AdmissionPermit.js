const mongoose = require("mongoose");

const admissionPermitSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    facilityName: { type: String, required: true },
    department: String,
    roomNumber: String,
    permitType: { type: String, enum: ["entry", "exit"], required: true },
    admissionDate: Date,
    dischargeDate: Date,
    reason: String,
    diagnosis: String,
    caseDetails: String,
    status: {
      type: String,
      enum: ["scheduled", "admitted", "discharged", "cancelled"],
      default: "scheduled",
    },
    permitFileUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdmissionPermit", admissionPermitSchema);
