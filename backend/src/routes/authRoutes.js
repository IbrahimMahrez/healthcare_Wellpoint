const express = require("express");
const { register, login, refreshToken, logout, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { body } = require("express-validator");

const router = express.Router();

router.post(
  "/register",
  validate([
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("phone").trim().notEmpty().withMessage("Phone is required"),
    body("role").optional().isIn(["patient", "doctor", "lab", "pharmacy"]).withMessage("Invalid role"),
  ]),
  register
);

router.post(
  "/login",
  validate([
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    body("role").optional().isIn(["patient", "doctor", "lab", "pharmacy"]).withMessage("Invalid role"),
  ]),
  login
);

router.post("/refresh", refreshToken);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;