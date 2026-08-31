const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    medicines: [
      {
        name: String,
        dosage: String,
        frequency: String,
        durationDays: Number,
      },
    ],
    notes: String,
    pharmacyOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy" },
    // Tracks the send-to-pharmacy / fulfillment lifecycle:
    // pending -> not sent to any pharmacy yet
    // sent -> automatically routed to the nearest matching pharmacy, awaiting them
    // fulfilled -> pharmacy prepared/dispatched the order
    // rejected -> pharmacy couldn't fulfill it (e.g. out of stock)
    status: { type: String, enum: ["pending", "sent", "fulfilled", "rejected"], default: "pending" },
    pharmacySentAt: Date,
    pharmacyDistanceKm: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
