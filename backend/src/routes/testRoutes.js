const express = require("express");
const {
  requestTest,
  requestTestForPatient,
  getMyTests,
  getLabQueue,
  uploadTestResult,
} = require("../controllers/testController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("patient"), requestTest);
router.post("/request-for-patient", protect, authorize("doctor"), requestTestForPatient);
router.get("/my", protect, authorize("patient"), getMyTests);
router.get("/lab-queue", protect, authorize("lab"), getLabQueue);
router.patch("/:id/results", protect, authorize("lab"), uploadTestResult);

module.exports = router;
