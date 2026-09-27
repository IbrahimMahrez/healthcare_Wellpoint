const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found - ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "File too large. Max size is 20MB." });
  }

  if (err.message === "File type not allowed. Allowed: JPEG, PNG, WebP, PDF, DOCX, CSV, JSON, HEIC, MP4") {
    return res.status(400).json({ success: false, message: err.message });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };