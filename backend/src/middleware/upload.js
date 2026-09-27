const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/csv",
    "application/json",
    "image/heic",
    "video/mp4",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed. Allowed: JPEG, PNG, WebP, PDF, DOCX, CSV, JSON, HEIC, MP4"), false);
  }
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "healthcare-superapp",
    allowedFormats: ["jpg", "png", "webp", "pdf", "docx", "csv", "json", "heic", "mp4"],
    transformation: [{ width: 2000, height: 2000, crop: "limit", quality: "auto:good" }],
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

const uploadFields = (fields) => {
  return upload.fields(fields);
};

const uploadSingle = (field) => {
  return upload.single(field);
};

module.exports = { upload, uploadSingle, uploadFields };