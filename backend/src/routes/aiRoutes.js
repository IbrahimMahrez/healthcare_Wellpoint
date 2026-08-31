const express = require("express");
const { aiQuery } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/query", protect, aiQuery);

module.exports = router;
