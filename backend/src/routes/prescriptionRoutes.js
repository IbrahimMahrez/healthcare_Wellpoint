const express = require("express");
const { createPrescription, getMyPrescriptions, sendToPharmacy } = require("../controllers/prescriptionController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("doctor"), createPrescription);
router.get("/my", protect, authorize("patient"), getMyPrescriptions);
router.post("/:id/send-to-pharmacy", protect, authorize("patient"), sendToPharmacy);

module.exports = router;
