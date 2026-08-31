const express = require("express");
const { searchLabs } = require("../controllers/labController");

const router = express.Router();

router.get("/search", searchLabs);

module.exports = router;
