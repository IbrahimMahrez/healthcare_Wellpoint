const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    userRole: { type: String, enum: ["patient", "doctor", "lab", "pharmacy", "admin"], required: true },
    type: {
      type: String,
      enum: [
        "appointment_booked",
        "appointment_confirmed",
        "appointment_cancelled",
        "appointment_started",
        "prescription_ready",
        "prescription_incoming",
        "prescription_fulfilled",
        "test_ready",
        "system",
      ],
      default: "system",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: String, // frontend route to open, e.g. /dashboard
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
