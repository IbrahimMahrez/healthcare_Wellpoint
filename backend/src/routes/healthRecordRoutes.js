const express = require("express");
const { getMyHealthRecord, upsertMyHealthRecord } = require("../controllers/healthRecordController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my", protect, authorize("patient"), getMyHealthRecord);
router.put("/my", protect, authorize("patient"), upsertMyHealthRecord);

module.exports = router;
