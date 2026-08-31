const mongoose = require("mongoose");

const labSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, default: "lab", immutable: true },
    address: { city: String, street: String },
    coordinates: { lat: Number, lng: Number },
    testsOffered: [
      {
        name: String,
        price: Number,
        homeSampleAvailable: Boolean,
      },
    ],
    contact: String,
    openingHours: String,
    homeSample: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lab", labSchema);
