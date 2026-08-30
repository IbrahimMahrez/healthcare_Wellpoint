const asyncHandler = require("express-async-handler");
const Prescription = require("../models/Prescription");
const Pharmacy = require("../models/Pharmacy");
const User = require("../models/User");
const notify = require("../services/notify");
const { distanceKm } = require("../utils/distance");

// @desc   Create a prescription (doctor issues after appointment)
// @route  POST /api/prescriptions
// @access Private (doctor)
const createPrescription = asyncHandler(async (req, res) => {
  const { appointmentId, patientId, medicines, notes } = req.body;

  if (!patientId || !medicines || !medicines.length) {
    res.status(400);
    throw new Error("patientId and at least one medicine are required");
  }

  const prescription = await Prescription.create({
    appointmentId,
    patientId,
    doctorId: req.user.id,
    medicines,
    notes,
  });

  // Previously nothing told the patient a prescription existed — they'd only
  // find out by opening the app and checking the Prescriptions tab.
  await notify({
    userId: patientId,
    userRole: "patient",
    type: "prescription_ready",
    title: "New prescription from your doctor",
    message: `Dr. ${req.user.account?.name || ""} issued you a prescription with ${medicines.length} medicine(s).`,
    link: "/dashboard",
  });

  res.status(201).json({ success: true, prescription });
});

// @desc   Get prescriptions for logged-in patient
// @route  GET /api/prescriptions/my
// @access Private (patient)
const getMyPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ patientId: req.user.id })
    .populate("doctorId", "name specialty")
    .populate("pharmacyOrderId", "name address")
    .sort({ createdAt: -1 });
  res.json({ success: true, prescriptions });
});

// @desc   Send a prescription to the nearest pharmacy that (ideally) stocks
//         the prescribed medicine, so the patient doesn't have to search
//         manually. Falls back to the nearest verified pharmacy overall if no
//         stock match is found.
// @route  POST /api/prescriptions/:id/send-to-pharmacy
// @access Private (patient)
const sendToPharmacy = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    res.status(404);
    throw new Error("Prescription not found");
  }
  if (prescription.patientId.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized for this prescription");
  }
  if (prescription.status === "sent" || prescription.status === "fulfilled") {
    res.status(400);
    throw new Error("This prescription has already been sent to a pharmacy");
  }

  const patient = await User.findById(req.user.id);
  const patientCoords = patient?.address?.coordinates;
  if (!patientCoords || typeof patientCoords.lat !== "number" || typeof patientCoords.lng !== "number") {
    res.status(400);
    throw new Error("Add your address/location to your profile so we can find the nearest pharmacy");
  }

  const medicineNames = (prescription.medicines || []).map((m) => m.name).filter(Boolean);
  const candidates = await Pharmacy.find({ verified: true });

  if (!candidates.length) {
    res.status(404);
    throw new Error("No verified pharmacies are available right now");
  }

  const ranked = candidates
    .map((pharmacy) => {
      const distance = distanceKm(
        patientCoords.lat,
        patientCoords.lng,
        pharmacy.coordinates?.lat,
        pharmacy.coordinates?.lng
      );
      const hasStock = (pharmacy.inventory || []).some(
        (item) => medicineNames.includes(item.medicineName) && item.stock > 0
      );
      return { pharmacy, distance, hasStock };
    })
    .filter((c) => Number.isFinite(c.distance))
    .sort((a, b) => {
      // Prefer pharmacies that actually have the medicine in stock; among
      // those (or if none match), prefer the nearest one.
      if (a.hasStock !== b.hasStock) return a.hasStock ? -1 : 1;
      return a.distance - b.distance;
    });

  const best = ranked[0];
  if (!best) {
    res.status(404);
    throw new Error("Couldn't determine pharmacy distances — pharmacies may be missing coordinates");
  }

  prescription.pharmacyOrderId = best.pharmacy._id;
  prescription.status = "sent";
  prescription.pharmacySentAt = new Date();
  prescription.pharmacyDistanceKm = Math.round(best.distance * 10) / 10;
  await prescription.save();

  await notify({
    userId: best.pharmacy._id,
    userRole: "pharmacy",
    type: "prescription_incoming",
    title: "New prescription order",
    message: `A patient ${prescription.pharmacyDistanceKm}km away sent you a prescription for ${medicineNames.join(", ") || "medicine"}.`,
    link: "/pharmacy-dashboard",
  });

  await notify({
    userId: prescription.patientId,
    userRole: "patient",
    type: "prescription_ready",
    title: "Prescription sent to pharmacy",
    message: `We sent your prescription to ${best.pharmacy.name} (${prescription.pharmacyDistanceKm}km away).`,
    link: "/dashboard",
  });

  res.json({ success: true, prescription, pharmacy: best.pharmacy, distanceKm: prescription.pharmacyDistanceKm });
});

module.exports = { createPrescription, getMyPrescriptions, sendToPharmacy };
