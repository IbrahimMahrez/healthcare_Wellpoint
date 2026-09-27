const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    room: { type: String, required: true, index: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    role: { type: String, enum: ["patient", "doctor", "lab", "pharmacy", "admin"], required: true },
    content: { type: String, required: true },
    text: String,
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ room: 1, createdAt: 1 });
messageSchema.index({ appointmentId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);