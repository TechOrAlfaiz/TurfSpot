import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import rootRouter from "./routes/index.js";
import { generalLimiter } from "./middleware/security/rateLimiter.js";

dotenv.config();

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

// General rate limiting across all API routes
app.use("/api", generalLimiter);

// Enhanced CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "http://localhost:5174",
      process.env.CLIENT_ORIGIN || "*",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-razorpay-signature"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  const provider = (process.env.PAYMENT_PROVIDER || "mock").toLowerCase().trim();
  res.status(200).json({
    status: "UP",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: global.isMockDB ? "MEMORY_FALLBACK" : "CONNECTED",
    service: "TurfSpot API Server (Production Ready)",
    integrations: {
      paymentProvider: provider,
      isTestMode: provider === "mock",
      razorpayReady: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      whatsappCloudApi: !!process.env.WHATSAPP_ACCESS_TOKEN,
      emailNotifications: !!(process.env.EMAIL && process.env.PASSWORD),
    },
  });
});

// Root welcome route
app.get("/", (req, res) => {
  res.json({
    status: "UP",
    message: "TurfSpot Backend API is online and operational",
    endpoints: {
      health: "/health",
      auth: "/api/user/auth",
      turfs: "/api/user/turf",
      bookings: "/api/user/booking",
    },
  });
});

// API routes
app.use("/api", rootRouter);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global production error handler
app.use((err, req, res, next) => {
  console.error("Unhandled API Error:", err.stack || err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error occurred",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
});

const port = process.env.PORT || 1234;

// Function to start the server
const startServer = async () => {
  try {
    // 1. Payment Provider Configuration Validation
    const provider = (process.env.PAYMENT_PROVIDER || "mock").toLowerCase().trim();
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction && provider === "mock") {
      console.error(
        "FATAL CONFIGURATION ERROR: Mock payment provider is strictly forbidden in production mode. Set PAYMENT_PROVIDER=razorpay and configure valid Razorpay credentials."
      );
      process.exit(1);
    }

    if (provider === "razorpay") {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        if (isProduction) {
          console.error(
            "FATAL CONFIGURATION ERROR: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be configured when PAYMENT_PROVIDER=razorpay in production mode."
          );
          process.exit(1);
        } else {
          console.warn(
            "⚠️ [Payment Config] Warning: Razorpay credentials missing with PAYMENT_PROVIDER=razorpay. Switch to PAYMENT_PROVIDER=mock for test mode."
          );
        }
      }
    }

    // 2. Connect to the database
    await connectDB();

    // 3. Start listening on port
    app.listen(port, () => {
      console.log(`TurfSpot API Server is running on http://localhost:${port} [Payment Mode: ${provider.toUpperCase()}]`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
};


// Start the server
startServer();


