const mongoose = require("mongoose");

// Short-lived WebRTC signaling messages for a single appointment's video call.
// Both sides poll for new signals from "the other side" every couple of
// seconds and post their own offer/answer/candidate here. Documents are only
// ever appended and are harmless to expire — see the TTL index below.
const signalSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true, index: true },
    fromRole: { type: String, enum: ["patient", "doctor"], required: true },
    kind: { type: String, enum: ["offer", "answer", "candidate", "hangup"], required: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

// Auto-delete signaling documents after 1 hour — they're only relevant for the
// lifetime of a single call and shouldn't accumulate in the database.
signalSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model("Signal", signalSchema);
