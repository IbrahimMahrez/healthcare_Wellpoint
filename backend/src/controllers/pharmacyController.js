const asyncHandler = require("express-async-handler");
const Pharmacy = require("../models/Pharmacy");
const Prescription = require("../models/Prescription");
const notify = require("../services/notify");

// @desc   Search pharmacies / medicines
// @route  GET /api/pharmacies/search
// @access Public
const searchPharmacies = asyncHandler(async (req, res) => {
  const { medicine, city } = req.query;
  const filter = {};
  if (city) filter["address.city"] = new RegExp(city, "i");
  if (medicine) filter["inventory.medicineName"] = new RegExp(medicine, "i");

  const pharmacies = await Pharmacy.find(filter).limit(20);
  res.json({ success: true, count: pharmacies.length, pharmacies });
});

// @desc   Get prescription orders routed to the logged-in pharmacy
// @route  GET /api/pharmacies/orders
// @access Private (pharmacy)
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Prescription.find({ pharmacyOrderId: req.user.id })
    .populate("patientId", "name phone address")
    .populate("doctorId", "name specialty")
    .sort({ pharmacySentAt: -1 });
  res.json({ success: true, count: orders.length, orders });
});

// @desc   Mark an incoming prescription order fulfilled or rejected
// @route  PATCH /api/pharmacies/orders/:id
// @access Private (pharmacy)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // "fulfilled" | "rejected"
  if (!["fulfilled", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("status must be 'fulfilled' or 'rejected'");
  }

  const order = await Prescription.findOne({ _id: req.params.id, pharmacyOrderId: req.user.id });
  if (!order) {
    res.status(404);
    throw new Error("Order not found for this pharmacy");
  }

  order.status = status;
  await order.save();

  await notify({
    userId: order.patientId,
    userRole: "patient",
    type: "prescription_fulfilled",
    title: status === "fulfilled" ? "Medicine ready" : "Pharmacy couldn't fulfill your order",
    message:
      status === "fulfilled"
        ? "The pharmacy prepared your medicine order. Check pickup/delivery details with them."
        : "The pharmacy couldn't fulfill this prescription. Please try sending it to another pharmacy.",
    link: "/dashboard",
  });

  res.json({ success: true, order });
});

module.exports = { searchPharmacies, getMyOrders, updateOrderStatus };
