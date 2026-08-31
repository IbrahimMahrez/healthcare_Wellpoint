const asyncHandler = require("express-async-handler");
const Review = require("../models/Review");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

// Recalculate and persist a doctor's average rating + review count.
const recalcDoctorRating = async (doctorId) => {
  const stats = await Review.aggregate([
    { $match: { targetType: "doctor", targetId: doctorId } },
    { $group: { _id: "$targetId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Doctor.findByIdAndUpdate(doctorId, { rating: Math.round(avg * 10) / 10, numReviews: count });
};

// @desc   Leave a review for a doctor (only after a completed appointment)
// @route  POST /api/reviews
// @access Private (patient)
const createReview = asyncHandler(async (req, res) => {
  const { targetType = "doctor", targetId, rating, comment, appointmentId } = req.body;

  if (!targetId || !rating) {
    res.status(400);
    throw new Error("targetId and rating are required");
  }

  if (appointmentId) {
    const appt = await Appointment.findOne({
      _id: appointmentId,
      patientId: req.user.id,
      providerId: targetId,
      status: "completed",
    });
    if (!appt) {
      res.status(400);
      throw new Error("You can only review a doctor after a completed appointment with them");
    }
  }

  const existing = await Review.findOne({ patientId: req.user.id, targetType, targetId });
  if (existing) {
    res.status(400);
    throw new Error("You already reviewed this provider");
  }

  const review = await Review.create({
    patientId: req.user.id,
    targetType,
    targetId,
    rating,
    comment,
  });

  if (targetType === "doctor") await recalcDoctorRating(targetId);

  res.status(201).json({ success: true, review });
});

// @desc   List reviews for a given doctor/lab/pharmacy
// @route  GET /api/reviews/:targetType/:targetId
// @access Public
const getReviewsForTarget = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.params;
  const reviews = await Review.find({ targetType, targetId })
    .populate("patientId", "name")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: reviews.length, reviews });
});

module.exports = { createReview, getReviewsForTarget };
