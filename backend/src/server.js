require("dotenv").config();
console.log("GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
console.log(
  "GEMINI_API_KEY length:",
  process.env.GEMINI_API_KEY?.length
);
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Routes
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const testRoutes = require("./routes/testRoutes");
const pharmacyRoutes = require("./routes/pharmacyRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");
const radiologyRoutes = require("./routes/radiologyRoutes");
const healthRecordRoutes = require("./routes/healthRecordRoutes");
const admissionRoutes = require("./routes/admissionRoutes");
const consultationRoutes = require("./routes/consultationRoutes");
const { startScheduler } = require("./services/scheduler");

connectDB();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api", limiter);

app.get("/api/health", (req, res) => res.json({ success: true, message: "Healthcare Super App API is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/pharmacies", pharmacyRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/radiology", radiologyRoutes);
app.use("/api/health-records", healthRecordRoutes);
app.use("/api/admissions", admissionRoutes);
app.use("/api/consultations", consultationRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Auto-starts consultation sessions at appointment time and auto-cancels
  // requests a provider never confirmed — see services/scheduler.js.
  startScheduler();
});
