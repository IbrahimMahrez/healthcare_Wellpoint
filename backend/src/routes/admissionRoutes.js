const express = require("express");
const { getMyPermits } = require("../controllers/admissionController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my", protect, authorize("patient"), getMyPermits);

module.exports = router;
