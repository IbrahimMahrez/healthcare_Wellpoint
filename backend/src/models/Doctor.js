const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const slotSchema = new mongoose.Schema(
  {
    day: { type: String, enum: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
    from: String, // "09:00"
    to: String, // "17:00"
  },
  { _id: false }
);

const clinicAddressSchema = new mongoose.Schema(
  {
    label: String,
    city: String,
    street: String,
    coordinates: { lat: Number, lng: Number },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, default: "doctor", immutable: true },
    specialty: { type: String, required: true, index: true },
    qualifications: [String],
    bio: String,
    clinicAddresses: [clinicAddressSchema],
    availableSlots: [slotSchema],
    consultationFees: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    avatarUrl: String,
  },
  { timestamps: true }
);

doctorSchema.index({ specialty: 1, "clinicAddresses.city": 1 });

doctorSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.passwordHash);
};

doctorSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

module.exports = mongoose.model("Doctor", doctorSchema);
