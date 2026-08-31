const express = require("express");
const {
  bookAppointment,
  updateAppointmentStatus,
  getMyAppointments,
} = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("patient"), bookAppointment);
router.get("/my", protect, getMyAppointments);
router.patch("/:id", protect, updateAppointmentStatus);

module.exports = router;
