const express = require("express");
const {
  getRoom,
  getMessages,
  sendMessage,
  uploadFiles,
  getSignals,
  sendSignal,
} = require("../controllers/consultationController");
const { protect } = require("../middleware/authMiddleware");
const { uploadSingle } = require("../middleware/upload");

const router = express.Router();

router.get("/:id", protect, getRoom);
router.get("/:id/messages", protect, getMessages);
router.post("/:id/messages", protect, sendMessage);
router.post("/:id/upload", protect, uploadSingle("files"), uploadFiles);
router.get("/:id/signals", protect, getSignals);
router.post("/:id/signals", protect, sendSignal);

module.exports = router;
