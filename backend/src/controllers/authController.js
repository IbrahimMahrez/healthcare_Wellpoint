const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Lab = require("../models/Lab");
const Pharmacy = require("../models/Pharmacy");
const RefreshToken = require("../models/RefreshToken");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");

const MODEL_BY_ROLE = { patient: User, doctor: Doctor, lab: Lab, pharmacy: Pharmacy, admin: User };
const PUBLIC_ROLES = ["patient", "doctor", "lab", "pharmacy"];

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
    passwordHash: password,
    role: role === "patient" || role === "admin" ? role : undefined,
    ...rest,
  });

  const accessToken = generateAccessToken(doc._id, role);
  const refreshToken = generateRefreshToken(doc._id, role);

  await RefreshToken.create({
    token: refreshToken,
    userId: doc._id,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    token: accessToken,
    user: { id: doc._id, name: doc.name, email: doc.email, role },
  });
});

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

  const accessToken = generateAccessToken(doc._id, role);
  const refreshToken = generateRefreshToken(doc._id, role);

  await RefreshToken.create({
    token: refreshToken,
    userId: doc._id,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    token: accessToken,
    user: { id: doc._id, name: doc.name, email: doc.email, role },
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    res.status(401);
    throw new Error("Refresh token not provided");
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      userId: decoded.id,
      revoked: false,
    });

    if (!storedToken) {
      res.status(403);
      throw new Error("Invalid or revoked refresh token");
    }

    const Model = MODEL_BY_ROLE[decoded.role] || User;
    const account = await Model.findById(decoded.id);
    if (!account) {
      res.status(401);
      throw new Error("Account not found");
    }

    const newAccessToken = generateAccessToken(decoded.id, decoded.role);
    const newRefreshToken = generateRefreshToken(decoded.id, decoded.role);

    await RefreshToken.findOneAndUpdate({ token: refreshToken }, { revoked: true });

    await RefreshToken.create({
      token: newRefreshToken,
      userId: decoded.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token: newAccessToken,
      user: { id: decoded.id, name: account.name, email: account.email, role: decoded.role },
    });
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      await RefreshToken.findOneAndUpdate({ token: refreshToken }, { revoked: true }).catch(() => {});
    }
    res.status(403);
    throw new Error("Invalid or expired refresh token");
  }
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
      await RefreshToken.findOneAndUpdate({ token }, { revoked: true }).catch(() => {});
    } catch (_) {}
  }

  res.cookie("refreshToken", "", { httpOnly: true, expires: new Date(0) });

  res.json({ success: true, message: "Logged out successfully" });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.account });
});

module.exports = { register, login, refreshToken, logout, getMe };