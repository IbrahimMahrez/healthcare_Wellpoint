const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Lab = require("../models/Lab");
const Pharmacy = require("../models/Pharmacy");

// NOTE: this must mirror MODEL_BY_ROLE in authController.js. Previously "lab"
// and "pharmacy" were missing here, so any lab/pharmacy account that logged in
// successfully would fail every subsequent authenticated request (protect()
// looked them up in the wrong collection and always got null back).
const MODEL_BY_ROLE = { patient: User, admin: User, doctor: Doctor, lab: Lab, pharmacy: Pharmacy };

// Verify JWT and attach req.user = { id, role }
const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const Model = MODEL_BY_ROLE[decoded.role] || User;
    const account = await Model.findById(decoded.id);
    if (!account) {
      res.status(401);
      throw new Error("Not authorized, account not found");
    }
    req.user = { id: decoded.id, role: decoded.role, account };
    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized, token invalid or expired");
  }
});

// Restrict route to specific roles: authorize("doctor", "admin")
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Role '${req.user?.role}' is not authorized for this action`);
  }
  next();
};

module.exports = { protect, authorize };
