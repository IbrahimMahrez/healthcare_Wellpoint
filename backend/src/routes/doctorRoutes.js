const express = require("express");
const { searchDoctors, getDoctorById, getMe, updateMyProfile, updateMySlots, getMyPatients, getPatientDetail } = require("../controllers/doctorController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { body } = require("express-validator");

const router = express.Router();

router.get("/", searchDoctors);
router.get("/me", protect, authorize("doctor"), getMe);
router.put("/me", protect, authorize("doctor"), validate([
  body("name").optional().trim().notEmpty().withMessage("Name is required"),
  body("phone").optional().trim().notEmpty().withMessage("Phone is required"),
  body("bio").optional().trim(),
  body("consultationFees").optional().isNumeric().withMessage("Fees must be a number"),
]), updateMyProfile);
router.put("/slots", protect, authorize("doctor"), validate([
  body("availableSlots").isArray().withMessage("availableSlots must be an array"),
]), updateMySlots);
router.get("/my-patients", protect, authorize("doctor"), getMyPatients);
router.get("/patients/:patientId", protect, authorize("doctor"), getPatientDetail);
router.get("/:id", getDoctorById);

module.exports = router;
