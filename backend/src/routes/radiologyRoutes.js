const express = require("express");
const { requestScan, getMyScans } = require("../controllers/radiologyController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("patient"), requestScan);
router.get("/my", protect, authorize("patient"), getMyScans);

module.exports = router;
