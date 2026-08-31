const express = require("express");
const {
  getStats,
  getAllDoctors,
  setDoctorVerification,
  getAllPatients,
  getAllAppointments,
  getAllPayments,
  getAllProviders,
  setAccountStatus,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Every route below requires a logged-in admin.
router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/doctors", getAllDoctors);
router.patch("/doctors/:id/verify", setDoctorVerification);
router.get("/patients", getAllPatients);
router.get("/appointments", getAllAppointments);
router.get("/payments", getAllPayments);
router.get("/providers", getAllProviders);
router.patch("/users/:role/:id/status", setAccountStatus);

module.exports = router;
