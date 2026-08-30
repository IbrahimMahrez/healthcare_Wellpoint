const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["doctor", "lab", "pharmacy"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "targetType" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
