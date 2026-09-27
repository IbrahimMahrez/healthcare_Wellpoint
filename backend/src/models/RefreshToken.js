const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    deviceInfo: String,
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    revoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// index created via expires: 0 in the schema field above

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);