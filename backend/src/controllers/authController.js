const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Lab = require("../models/Lab");
const Pharmacy = require("../models/Pharmacy");
const generateToken = require("../utils/generateToken");

const MODEL_BY_ROLE = { patient: User, doctor: Doctor, lab: Lab, pharmacy: Pharmacy, admin: User };
// "admin" is intentionally excluded from public self-registration for security —
// create the first admin via `npm run create-admin` (src/utils/createAdmin.js).
const PUBLIC_ROLES = ["patient", "doctor", "lab", "pharmacy"];

// @desc   Register a new account (patient/doctor/lab/pharmacy)
// @route  POST /api/auth/register
// @access Public
const register = asyncHandler(async (req, res) => {
  const { role = "patient", name, email, phone, password, ...rest } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  if (!PUBLIC_ROLES.includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  const Model = MODEL_BY_ROLE[role];
  if (!Model) {
    res.status(400);
    throw new Error("Invalid role");
  }

  const exists = await Model.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const doc = await Model.create({
    name,
    email,
    phone,
    passwordHash: password, // hashed via pre-save hook
    role: role === "patient" || role === "admin" ? role : undefined,
    ...rest,
  });

  res.status(201).json({
    success: true,
    token: generateToken(doc._id, role),
    user: { id: doc._id, name: doc.name, email: doc.email, role },
  });
});

// @desc   Login for any role
// @route  POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password, role = "patient" } = req.body;

  const Model = MODEL_BY_ROLE[role];
  if (!Model) {
    res.status(400);
    throw new Error("Invalid role");
  }

  const doc = await Model.findOne({ email }).select("+passwordHash");
  if (!doc || !(await doc.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    success: true,
    token: generateToken(doc._id, role),
    user: { id: doc._id, name: doc.name, email: doc.email, role },
  });
});

// @desc   Get current logged-in account
// @route  GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.account });
});

module.exports = { register, login, getMe };
