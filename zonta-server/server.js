import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import checkoutRoutes from "./routes/checkoutRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import { handleStripeWebhook } from "./controllers/checkoutController.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { protect } from "./middlewares/authMiddleware.js";

dotenv.config({ override: true });
const app = express();

// 🛡️ CORS (allow frontend URL during development)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
    methods: ["GET", "POST"],
  })
);


app.post(
  "/api/checkout/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleStripeWebhook
);

// ✅ Parse normal JSON for other routes
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", protect, orderRoutes);


app.get("/", (req, res) => {
  res.send("✅ Zonta backend modularized and running!");
});


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ============================
// ⚠️ Error Handler
// ============================
app.use(errorHandler);

// ============================
// 🚀 START SERVER
// ============================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Sanity project: ${process.env.SANITY_PROJECT_ID}`);
  console.log(`✅ Stripe key loaded: ${!!process.env.STRIPE_SECRET_KEY}`);
  console.log(`✅ Admin email: ${process.env.ADMIN_EMAIL || "❌ Not Loaded"}`);
  console.log(`✅ Admin password loaded: ${!!process.env.ADMIN_PASSWORD}`);
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});