const asyncHandler = require("express-async-handler");
const Lab = require("../models/Lab");

// @desc   Search/list labs
// @route  GET /api/labs/search
// @access Public
const searchLabs = asyncHandler(async (req, res) => {
  const { city, test } = req.query;
  const filter = {};
  if (city) filter["address.city"] = new RegExp(city, "i");
  if (test) filter["testsOffered.name"] = new RegExp(test, "i");

  const labs = await Lab.find(filter).limit(50);
  res.json({ success: true, count: labs.length, labs });
});

module.exports = { searchLabs };
