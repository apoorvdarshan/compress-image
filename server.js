const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const compression = require("compression");

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow inline styles for development
  })
);

// Compression middleware
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-domain.com"]
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files
app.use(express.static(__dirname));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10, // Maximum 10 files at once
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// API Routes

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Image compression endpoint
app.post("/api/compress", upload.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "No files uploaded",
      });
    }

    const { quality = 80, format = "original", maxWidth, maxHeight } = req.body;
    const results = [];

    for (const file of req.files) {
      try {
        const result = await compressImage(file, {
          quality: parseInt(quality),
          format,
          maxWidth: maxWidth ? parseInt(maxWidth) : undefined,
          maxHeight: maxHeight ? parseInt(maxHeight) : undefined,
        });

        results.push({
          originalName: file.originalname,
          originalSize: file.size,
          compressedSize: result.size,
          savings: (((file.size - result.size) / file.size) * 100).toFixed(1),
          data: result.data.toString("base64"),
          format: result.format,
          width: result.info.width,
          height: result.info.height,
        });
      } catch (error) {
        console.error(`Error compressing ${file.originalname}:`, error);
        results.push({
          originalName: file.originalname,
          error: "Failed to compress image",
        });
      }
    }

    res.json({
      success: true,
      results: results,
      totalFiles: req.files.length,
      processedFiles: results.filter((r) => !r.error).length,
    });
  } catch (error) {
    console.error("Compression API error:", error);
    res.status(500).json({
      error: "Internal server error during compression",
    });
  }
});

// Image resizing endpoint
app.post("/api/resize", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const { width, height, maintainAspectRatio = true } = req.body;

    if (!width && !height) {
      return res.status(400).json({
        error: "Width or height must be specified",
      });
    }

    const resizeOptions = {};
    if (width) resizeOptions.width = parseInt(width);
    if (height) resizeOptions.height = parseInt(height);

    if (maintainAspectRatio === "false") {
      resizeOptions.fit = "fill";
    }

    const result = await sharp(req.file.buffer)
      .resize(resizeOptions)
      .jpeg({ quality: 90 })
      .toBuffer({ resolveWithObject: true });

    res.json({
      success: true,
      originalSize: req.file.size,
      newSize: result.data.length,
      width: result.info.width,
      height: result.info.height,
      data: result.data.toString("base64"),
    });
  } catch (error) {
    console.error("Resize API error:", error);
    res.status(500).json({
      error: "Internal server error during resizing",
    });
  }
});

// Image format conversion endpoint
app.post("/api/convert", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const { format, quality = 90 } = req.body;
    const supportedFormats = ["jpeg", "png", "webp", "tiff", "avif"];

    if (!supportedFormats.includes(format)) {
      return res.status(400).json({
        error: `Unsupported format. Supported formats: ${supportedFormats.join(
          ", "
        )}`,
      });
    }

    let sharpInstance = sharp(req.file.buffer);

    switch (format) {
      case "jpeg":
        sharpInstance = sharpInstance.jpeg({ quality: parseInt(quality) });
        break;
      case "png":
        sharpInstance = sharpInstance.png({ quality: parseInt(quality) });
        break;
      case "webp":
        sharpInstance = sharpInstance.webp({ quality: parseInt(quality) });
        break;
      case "tiff":
        sharpInstance = sharpInstance.tiff({ quality: parseInt(quality) });
        break;
      case "avif":
        sharpInstance = sharpInstance.avif({ quality: parseInt(quality) });
        break;
    }

    const result = await sharpInstance.toBuffer({ resolveWithObject: true });

    res.json({
      success: true,
      originalFormat: req.file.mimetype,
      newFormat: `image/${format}`,
      originalSize: req.file.size,
      newSize: result.data.length,
      data: result.data.toString("base64"),
    });
  } catch (error) {
    console.error("Convert API error:", error);
    res.status(500).json({
      error: "Internal server error during conversion",
    });
  }
});

// Batch processing endpoint
app.post("/api/batch-process", upload.array("images", 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "No files uploaded",
      });
    }

    const operations = JSON.parse(req.body.operations || "[]");
    const results = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const operation = operations[i] || operations[0] || {};

      try {
        let sharpInstance = sharp(file.buffer);

        // Apply operations in sequence
        if (operation.resize) {
          sharpInstance = sharpInstance.resize(operation.resize);
        }

        if (operation.rotate) {
          sharpInstance = sharpInstance.rotate(operation.rotate);
        }

        if (operation.blur) {
          sharpInstance = sharpInstance.blur(operation.blur);
        }

        if (operation.sharpen) {
          sharpInstance = sharpInstance.sharpen();
        }

        if (operation.grayscale) {
          sharpInstance = sharpInstance.grayscale();
        }

        // Apply format and quality
        const format = operation.format || "jpeg";
        const quality = operation.quality || 80;

        switch (format) {
          case "jpeg":
            sharpInstance = sharpInstance.jpeg({ quality });
            break;
          case "png":
            sharpInstance = sharpInstance.png({ quality });
            break;
          case "webp":
            sharpInstance = sharpInstance.webp({ quality });
            break;
        }

        const result = await sharpInstance.toBuffer({
          resolveWithObject: true,
        });

        results.push({
          originalName: file.originalname,
          originalSize: file.size,
          processedSize: result.data.length,
          savings: (
            ((file.size - result.data.length) / file.size) *
            100
          ).toFixed(1),
          data: result.data.toString("base64"),
          operations: operation,
          info: result.info,
        });
      } catch (error) {
        console.error(`Error processing ${file.originalname}:`, error);
        results.push({
          originalName: file.originalname,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      results: results,
      totalFiles: req.files.length,
      processedFiles: results.filter((r) => !r.error).length,
    });
  } catch (error) {
    console.error("Batch processing error:", error);
    res.status(500).json({
      error: "Internal server error during batch processing",
    });
  }
});

// Get image metadata endpoint
app.post("/api/metadata", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const metadata = await sharp(req.file.buffer).metadata();

    res.json({
      success: true,
      filename: req.file.originalname,
      size: req.file.size,
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      channels: metadata.channels,
      depth: metadata.depth,
      density: metadata.density,
      hasAlpha: metadata.hasAlpha,
      hasProfile: metadata.hasProfile,
      space: metadata.space,
    });
  } catch (error) {
    console.error("Metadata API error:", error);
    res.status(500).json({
      error: "Internal server error while reading metadata",
    });
  }
});

// Serve the main application
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Helper function for image compression
async function compressImage(file, options) {
  const { quality, format, maxWidth, maxHeight } = options;

  let sharpInstance = sharp(file.buffer);

  // Resize if dimensions are specified
  if (maxWidth || maxHeight) {
    sharpInstance = sharpInstance.resize({
      width: maxWidth,
      height: maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Apply format and compression
  switch (format) {
    case "jpeg":
      sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
      break;
    case "png":
      sharpInstance = sharpInstance.png({
        quality,
        compressionLevel: 9,
        adaptiveFiltering: true,
      });
      break;
    case "webp":
      sharpInstance = sharpInstance.webp({ quality, effort: 6 });
      break;
    default:
      // Keep original format but apply quality
      const metadata = await sharp(file.buffer).metadata();
      if (metadata.format === "jpeg") {
        sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
      } else if (metadata.format === "png") {
        sharpInstance = sharpInstance.png({
          quality,
          compressionLevel: 9,
        });
      } else if (metadata.format === "webp") {
        sharpInstance = sharpInstance.webp({ quality, effort: 6 });
      }
      break;
  }

  const result = await sharpInstance.toBuffer({ resolveWithObject: true });

  return {
    data: result.data,
    info: result.info,
    size: result.data.length,
    format: result.info.format,
  };
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Express error:", error);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large. Maximum size is 50MB.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: "Too many files. Maximum is 10 files at once.",
      });
    }
  }

  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Image Compressor Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${__dirname}`);
  console.log(`🔒 Security headers enabled`);
  console.log(`⚡ Compression enabled`);
  console.log(`🛡️  Rate limiting: 100 requests per 15 minutes`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

module.exports = app;
