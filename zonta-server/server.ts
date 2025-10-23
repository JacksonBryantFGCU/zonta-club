import dotenv from "dotenv";
dotenv.config({ override: true });

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs-extra";
import helmet from "helmet";

// Path-alias imports
import { handleStripeWebhook } from "@controllers/checkoutController";
import { protect } from "@middlewares/authMiddleware";
import { errorHandler } from "@middlewares/errorHandler";
import authRoutes from "@routes/authRoutes";
import checkoutRoutes from "@routes/checkoutRoutes";
import orderRoutes from "@routes/orderRoutes";
import receiptRoutes from "@routes/receiptRoutes";

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
    crossOriginEmbedderPolicy: false, // ⚠️ required for Stripe / Sanity compatibility
  })
);

/* =========================================================
   🌍 CORS Setup
   ========================================================= */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  })
);

/* =========================================================
   💳 Stripe Webhook (must be raw body)
   ========================================================= */
app.post(
  "/api/checkout/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleStripeWebhook
);

/* =========================================================
   🔠 Normal JSON Parsing for all other routes
   ========================================================= */
app.use(express.json());

/* =========================================================
   🧾 Serve Generated PDF Receipts
   ========================================================= */
const receiptsDir = path.resolve("receipts");
fs.ensureDirSync(receiptsDir);
app.use("/receipts", express.static(receiptsDir));

/* =========================================================
   🚦 Routes
   ========================================================= */
app.use("/api/auth", authRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", protect as unknown as express.RequestHandler, orderRoutes);
app.use("/api/receipts", receiptRoutes);

/* =========================================================
   🏠 Root Route
   ========================================================= */
app.get("/", (_req: Request, res: Response) => {
  res.send("✅ Zonta backend modularized with receipts + email service!");
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
   🧑‍💼 Admin Logging (from admins.json)
   ========================================================= */
const adminsPath = path.resolve("./src/config/admins.json");
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
   🚀 Start Server
   ========================================================= */
const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log("==========================================");
  console.log(`✅ Sanity project: ${process.env.SANITY_PROJECT_ID}`);
  console.log(`✅ Stripe key loaded: ${!!process.env.STRIPE_SECRET_KEY}`);
  console.log(`✅ Admin authentication: using ${adminCount} admin account(s) from admins.json`);
  console.log(`✅ Helmet security middleware active`);
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log("==========================================");
});

export default app;
