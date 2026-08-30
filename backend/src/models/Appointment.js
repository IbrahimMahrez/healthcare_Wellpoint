const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    providerType: { type: String, enum: ["doctor", "lab"], default: "doctor" },
    // providerModel stores the actual model name ("Doctor" | "Lab") so refPath
    // can resolve it per-document. It's kept in sync with providerType below.
    providerModel: { type: String, enum: ["Doctor", "Lab"], default: "Doctor" },
    providerId: { type: mongoose.Schema.Types.ObjectId, refPath: "providerModel", required: true },
    datetime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    consultationType: { type: String, enum: ["video", "audio", "text", "in-person"], default: "video" },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    meetingLink: String,
    notes: String,
    // Set automatically by the scheduler once the appointment's datetime is
    // reached, so the in-app consultation room (chat + video) is opened
    // exactly once and both sides get notified.
    sessionStarted: { type: Boolean, default: false },
    sessionStartedAt: Date,
    // Set automatically by the scheduler if a doctor never responds to a
    // pending request before its time arrives, so the patient isn't left
    // hanging silently.
    autoCancelled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

appointmentSchema.pre("validate", function (next) {
  this.providerModel = this.providerType === "lab" ? "Lab" : "Doctor";
  next();
});

module.exports = mongoose.model("Appointment", appointmentSchema);
