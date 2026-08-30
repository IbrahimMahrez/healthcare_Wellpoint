const mongoose = require("mongoose");

const pharmacySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, default: "pharmacy", immutable: true },
    address: { city: String, street: String },
    coordinates: { lat: Number, lng: Number },
    inventory: [
      {
        medicineName: String,
        price: Number,
        stock: Number,
      },
    ],
    delivery: { type: Boolean, default: true },
    openingHours: String,
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pharmacy", pharmacySchema);
