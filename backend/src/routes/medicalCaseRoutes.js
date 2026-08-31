const express = require("express");
const { createCase, getCasesForPatient, getMyCases, updateCaseStatus } = require("../controllers/medicalCaseController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("doctor"), createCase);
router.get("/my", protect, authorize("patient"), getMyCases);
router.get("/patient/:patientId", protect, authorize("doctor"), getCasesForPatient);
router.patch("/:id", protect, authorize("doctor"), updateCaseStatus);

module.exports = router;
