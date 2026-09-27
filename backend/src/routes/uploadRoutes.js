const express = require("express");
const { uploadSingle, uploadFields } = require("../middleware/upload");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/avatar",
  protect,
  uploadSingle("avatar"),
  (req, res) => {
    res.json({ success: true, url: req.file?.path });
  }
);

router.post(
  "/medical",
  protect,
  uploadFields([{ name: "files", maxCount: 5 }]),
  (req, res) => {
    const urls = req.files?.map((f) => f.path) || [];
    res.json({ success: true, urls });
  }
);

router.post(
  "/lab-result",
  protect,
  uploadSingle("file"),
  (req, res) => {
    res.json({ success: true, url: req.file?.path });
  }
);

module.exports = router;