const express = require("express");
const { searchDoctors, getDoctorById, updateMyProfile, getMyPatients, getPatientDetail } = require("../controllers/doctorController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", searchDoctors);
router.put("/me", protect, authorize("doctor"), updateMyProfile);
router.get("/my-patients", protect, authorize("doctor"), getMyPatients);
router.get("/patients/:patientId", protect, authorize("doctor"), getPatientDetail);
router.get("/:id", getDoctorById);

module.exports = router;
