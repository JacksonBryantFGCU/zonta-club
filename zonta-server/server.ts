import dotenv from "dotenv";
dotenv.config({ override: true });

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";

import path from "path";

import fs from "fs-extra";

// Keep these paths if server.ts is at project root and your code lives in ./src/**
import { handleStripeWebhook } from "@controllers/checkoutController";
import { protect } from "@middlewares/authMiddleware";
import { errorHandler } from "@middlewares/errorHandler";
import authRoutes from "@routes/authRoutes";
import checkoutRoutes from "@routes/checkoutRoutes";
import orderRoutes from "@routes/orderRoutes";
import receiptRoutes from "@routes/receiptRoutes";

const app = express();

/**
 * CORS
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
    methods: ["GET", "POST"],
  })
);

/**
 * Stripe webhook must use the raw body
 * IMPORTANT: This must be registered BEFORE express.json()
 */
app.post(
  "/api/checkout/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleStripeWebhook
);

/**
 * Normal JSON parsing for other routes
 */
app.use(express.json());

/**
 * Static file serving for generated receipts
 */
const receiptsDir = path.resolve("receipts");
fs.ensureDirSync(receiptsDir);
app.use("/receipts", express.static(receiptsDir));

/**
 * Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use(
  "/api/orders",
  protect as unknown as express.RequestHandler,
  orderRoutes
);
app.use("/api/receipts", receiptRoutes);

/**
 * Root
 */
app.get("/", (_req: Request, res: Response) => {
  res.send("✅ Zonta backend modularized with receipts + email service!");
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/**
 * Global error handler
 */
app.use(
  errorHandler as unknown as (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => void
);

/**
 * Start server
 */
const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`✅ Sanity project: ${process.env.SANITY_PROJECT_ID}`);
  console.log(`✅ Stripe key loaded: ${!!process.env.STRIPE_SECRET_KEY}`);
  console.log(`✅ Admin email: ${process.env.ADMIN_EMAIL || "❌ Not Loaded"}`);
  console.log(`✅ Admin password loaded: ${!!process.env.ADMIN_PASSWORD}`);
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

export default app;
