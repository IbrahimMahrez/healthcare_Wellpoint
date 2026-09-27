require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { createServer } = require("http");
const { initSocket } = require("./services/socket");
const { cacheDelPattern } = require("./utils/cache");

const connectDB = require("./config/db");

const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

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
const labRoutes = require("./routes/labRoutes");
const medicalCaseRoutes = require("./routes/medicalCaseRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const { startScheduler } = require("./services/scheduler");

console.log("GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
console.log("CLIENT_URL:", process.env.CLIENT_URL);

connectDB();

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "ws://localhost:*", "wss://localhost:*", "http://localhost:5000", "https://*.cloudinary.com"],
        fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
        objectSrc: ["'none'"],
        frameSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

const clientUrl = process.env.CLIENT_URL?.replace(/\/$/, "");
const allowedOrigins = ["http://localhost:5173", clientUrl].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.log("Blocked CORS origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Authorization"],
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 300 : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", limiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Healthcare Super App API is running" });
});

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
app.use("/api/labs", labRoutes);
app.use("/api/medical-cases", medicalCaseRoutes);
app.use("/api/upload", uploadRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startScheduler();
});

module.exports = { app, server };