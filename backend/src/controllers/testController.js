const asyncHandler = require("express-async-handler");
const TestResult = require("../models/TestResult");
const notify = require("../services/notify");
const { assertDoctorTreatsPatient } = require("../utils/ownership");

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

// @desc   Doctor requests a lab test for one of their patients
// @route  POST /api/tests/request-for-patient
// @access Private (doctor)
const requestTestForPatient = asyncHandler(async (req, res) => {
  const { patientId, testName, labId } = req.body;
  if (!patientId || !testName || !labId) {
    res.status(400);
    throw new Error("patientId, testName and labId are required");
  }

  await assertDoctorTreatsPatient(res, req.user.id, patientId);

  const test = await TestResult.create({ testName, labId, patientId, doctorId: req.user.id });

  await notify({
    userId: labId,
    userRole: "lab",
    type: "system",
    title: "New test request from a doctor",
    message: `Dr. ${req.user.account?.name || ""} requested "${testName}" for a patient.`,
    link: "/lab-dashboard",
  });

  await notify({
    userId: patientId,
    userRole: "patient",
    type: "system",
    title: "Your doctor requested a lab test",
    message: `Your doctor requested "${testName}". You'll be notified once results are ready.`,
    link: "/lab-tests",
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

module.exports = { requestTest, requestTestForPatient, getMyTests, getLabQueue, uploadTestResult };
