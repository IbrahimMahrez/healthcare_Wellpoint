const express = require("express");
const { searchDoctors, getDoctorById, updateMyProfile } = require("../controllers/doctorController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", searchDoctors);
router.put("/me", protect, authorize("doctor"), updateMyProfile);
router.get("/:id", getDoctorById);

module.exports = router;
