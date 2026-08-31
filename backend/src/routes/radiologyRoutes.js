const express = require("express");
const {
  requestScan,
  requestScanForPatient,
  getMyScans,
  getLabQueue,
  uploadReport,
} = require("../controllers/radiologyController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("patient"), requestScan);
router.post("/request-for-patient", protect, authorize("doctor"), requestScanForPatient);
router.get("/my", protect, authorize("patient"), getMyScans);
router.get("/lab-queue", protect, authorize("lab"), getLabQueue);
router.patch("/:id/report", protect, authorize("lab"), uploadReport);

module.exports = router;
