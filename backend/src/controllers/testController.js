const asyncHandler = require("express-async-handler");
const TestResult = require("../models/TestResult");
const notify = require("../services/notify");

// @desc   Request a lab test
// @route  POST /api/tests
// @access Private (patient)
const requestTest = asyncHandler(async (req, res) => {
  const { testName, labId } = req.body;
  const test = await TestResult.create({ testName, labId, patientId: req.user.id });

  await notify({
    userId: labId,
    userRole: "lab",
    type: "system",
    title: "New test request",
    message: `A patient requested "${testName}".`,
    link: "/lab-dashboard",
  });

  res.status(201).json({ success: true, test });
});

// @desc   Get my test results
// @route  GET /api/tests/my
// @access Private (patient)
const getMyTests = asyncHandler(async (req, res) => {
  const tests = await TestResult.find({ patientId: req.user.id }).populate("labId", "name").sort({ createdAt: -1 });
  res.json({ success: true, tests });
});

// @desc   Get tests assigned to the logged-in lab
// @route  GET /api/tests/lab-queue
// @access Private (lab)
const getLabQueue = asyncHandler(async (req, res) => {
  const tests = await TestResult.find({ labId: req.user.id })
    .populate("patientId", "name phone")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: tests.length, tests });
});

// @desc   Lab enters/uploads results for a test it owns
// @route  PATCH /api/tests/:id/results
// @access Private (lab)
const uploadTestResult = asyncHandler(async (req, res) => {
  const { resultsFileUrl, numericResults, interpretationNotes, status } = req.body;

  const test = await TestResult.findOne({ _id: req.params.id, labId: req.user.id });
  if (!test) {
    res.status(404);
    throw new Error("Test not found for this lab");
  }

  if (resultsFileUrl !== undefined) test.resultsFileUrl = resultsFileUrl;
  if (numericResults !== undefined) test.numericResults = numericResults;
  if (interpretationNotes !== undefined) test.interpretationNotes = interpretationNotes;
  test.status = status && ["requested", "processing", "completed"].includes(status) ? status : "completed";
  await test.save();

  if (test.status === "completed") {
    // This was previously entirely missing — a lab had no endpoint at all to
    // record results, so patients could never actually receive them.
    await notify({
      userId: test.patientId,
      userRole: "patient",
      type: "test_ready",
      title: "Test results ready",
      message: `Your results for "${test.testName}" are ready.`,
      link: "/lab-tests",
    });
  }

  res.json({ success: true, test });
});

module.exports = { requestTest, getMyTests, getLabQueue, uploadTestResult };
