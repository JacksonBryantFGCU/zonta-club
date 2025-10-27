import path from "path";

import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import fs from "fs-extra";
import helmet from "helmet";

import { handleStripeWebhook } from "@controllers/v2/checkoutController";
import { errorHandler } from "@middlewares/errorHandler";
import { adminLimiter } from "@middlewares/rateLimiter";
import authRoutesV2 from "@routes/v2/authRoutesV2";
import eventsRoutesV2 from "@routes/v2/eventsRoutesV2";
import membershipsPublicRoutes from "@routes/v2/membershipsPublicRoutes";
import membershipsRoutesV2 from "@routes/v2/membershipsRoutesV2";
import ordersRoutesV2 from "@routes/v2/ordersRoutesV2";
import productsRoutesV2 from "@routes/v2/productsRoutesV2";
import scholarshipsRoutesV2 from "@routes/v2/scholarshipsRoutesV2";
import settingsRoutesV2 from "@routes/v2/settingsRoutesV2";

dotenv.config({ override: true });
const app = express();

/* =========================================================
   🧠 SECURITY — Helmet Middleware
   ========================================================= */
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:", "https:"],
        "script-src": ["'self'", "https://js.stripe.com"],
        "frame-src": ["'self'", "https://js.stripe.com"],
      },
    },
    crossOriginEmbedderPolicy: false, // required for Stripe + Sanity compatibility
  })
);

/* =========================================================
   🌍 CORS
   ========================================================= */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

/* =========================================================
   💳 Stripe Webhook (raw body for signature verification)
   ========================================================= */
app.post(
  "/api/checkout/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleStripeWebhook
);

/* =========================================================
   🔠 JSON Parsing + Rate Limiting
   ========================================================= */
app.use(express.json());
app.use("/api/v2", adminLimiter);

/* =========================================================
   🧾 Serve Generated PDF Receipts
   ========================================================= */
const receiptsDir = path.resolve("receipts");
fs.ensureDirSync(receiptsDir);
app.use("/receipts", express.static(receiptsDir));

/* =========================================================
   🚦 Admin API Routes
   ========================================================= */
// Public
app.use("/api/v2/auth", authRoutesV2);

// Protected (use protect middleware inside each route file)
app.use("/api/v2/admin/orders", ordersRoutesV2);
app.use("/api/v2/admin/products", productsRoutesV2);
app.use("/api/v2/admin/events", eventsRoutesV2);
app.use("/api/v2/admin/scholarships", scholarshipsRoutesV2);
app.use("/api/v2/admin/settings", settingsRoutesV2);
app.use("/api/v2/admin/memberships", membershipsRoutesV2);
app.use("/api/v2/memberships", membershipsPublicRoutes);

/* =========================================================
   🏠 Root Route
   ========================================================= */
app.get("/", (_req: Request, res: Response) => {
  res.send("🚀 Zonta Admin Backend running securely at /api/v2/admin/*");
});

/* =========================================================
   ❌ 404 Handler
   ========================================================= */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/* =========================================================
   ⚠️ Global Error Handler
   ========================================================= */
app.use(
  errorHandler as unknown as (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => void
);

/* =========================================================
   🧑‍💼 Admin Info (for logging only)
   ========================================================= */
const adminsPath = path.resolve("src/config/admins.json");
let adminCount = 0;
try {
  if (fs.existsSync(adminsPath)) {
    const adminsData = JSON.parse(fs.readFileSync(adminsPath, "utf-8"));
    adminCount = Array.isArray(adminsData) ? adminsData.length : 0;
  }
} catch (err) {
  console.warn("⚠️ Could not read admins.json:", err);
}

/* =========================================================
   🧭 Debug: List Registered Routes (safe)
   ========================================================= */
function logRegisteredRoutes(app: express.Application) {
  if (!app._router || !app._router.stack) {
    console.warn("⚠️ No routes found or Express router not initialized yet.");
    return;
  }

  console.log("\n🛣️ Registered routes:");
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route?.path) {
      const methods = Object.keys(middleware.route.methods)
        .map((m) => m.toUpperCase())
        .join(", ");
      console.log(` - ${methods} ${middleware.route.path}`);
    } else if (middleware.name === "router" && middleware.handle?.stack) {
      middleware.handle.stack.forEach((layer: any) => {
        if (layer.route?.path) {
          const methods = Object.keys(layer.route.methods)
            .map((m) => m.toUpperCase())
            .join(", ");
          console.log(` - ${methods} ${layer.route.path}`);
        }
      });
    }
  });
}

/* =========================================================
   🚀 Start Server
   ========================================================= */
const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log("==========================================");
  console.log(`✅ Sanity project: ${process.env.SANITY_PROJECT_ID}`);
  console.log(`✅ Admin count: ${adminCount}`);
  console.log(`✅ Helmet security middleware active`);
  console.log(`✅ Rate limiting enabled for /api/v2 routes`);
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log("==========================================");

  // 🧭 Log routes after the app is fully initialized
  setTimeout(() => logRegisteredRoutes(app), 250);
});

export default app;