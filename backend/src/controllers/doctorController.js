const asyncHandler = require("express-async-handler");
const Doctor = require("../models/Doctor");

// @desc   Search doctors by specialty, city, rating, price, availability
// @route  GET /api/doctors
// @access Public
const searchDoctors = asyncHandler(async (req, res) => {
  const { specialty, city, minRating, maxFee, sort, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (specialty) filter.specialty = new RegExp(specialty, "i");
  if (city) filter["clinicAddresses.city"] = new RegExp(city, "i");
  if (minRating) filter.rating = { $gte: Number(minRating) };
  if (maxFee) filter.consultationFees = { ...(filter.consultationFees || {}), $lte: Number(maxFee) };

  const SORTS = {
    rating: { rating: -1 },
    price_asc: { consultationFees: 1 },
    price_desc: { consultationFees: -1 },
    reviews: { numReviews: -1 },
  };
  const sortBy = SORTS[sort] || SORTS.rating;

  const skip = (Number(page) - 1) * Number(limit);

  const [doctors, total] = await Promise.all([
    Doctor.find(filter).sort(sortBy).skip(skip).limit(Number(limit)),
    Doctor.countDocuments(filter),
  ]);

  res.json({ success: true, count: doctors.length, total, page: Number(page), doctors });
});

// @desc   Get doctor details
// @route  GET /api/doctors/:id
// @access Public
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }
  res.json({ success: true, doctor });
});

// @desc   Update own doctor profile
// @route  PUT /api/doctors/me
// @access Private (doctor)
const updateMyProfile = asyncHandler(async (req, res) => {
  const allowed = ["name", "phone", "bio", "qualifications", "clinicAddresses", "availableSlots", "consultationFees", "avatarUrl"];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const doctor = await Doctor.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
  res.json({ success: true, doctor });
});

module.exports = { searchDoctors, getDoctorById, updateMyProfile };
