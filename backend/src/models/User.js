const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema(
  {
    city: String,
    street: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["patient", "doctor", "lab", "pharmacy", "admin"],
      default: "patient",
    },
    address: addressSchema,
    medicalHistory: [
      {
        date: { type: Date, default: Date.now },
        notes: String,
        doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
        files: [String],
      },
    ],
    insuranceInfo: {
      provider: String,
      policyNumber: String,
    },
    isVerified: { type: Boolean, default: false },
    avatarUrl: String,
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.passwordHash);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

module.exports = mongoose.model("User", userSchema);
