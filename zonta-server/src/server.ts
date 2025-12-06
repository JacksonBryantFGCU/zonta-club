// zonta-server/server.ts

import path from "path";

import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import fs from "fs-extra";
import helmet from "helmet";

import { handleStripeWebhook } from "@controllers/checkoutController";
import { cleanupUnpaidApplications } from "@controllers/membershipApplicationsController";
import { errorHandler } from "@middlewares/errorHandler";
import { adminLimiter } from "@middlewares/rateLimiter";
import authRoutes from "@routes/authRoutes";
import categoriesRoutes from "@routes/categoriesRoutes";
import checkoutRoutes from "@routes/checkoutRoutes";
import donationsRoutes from "@routes/donationsRoutes";
import eventsRoutes from "@routes/eventsRoutes";
import leadershipRoutes from "@routes/leadershipRoutes";
import membershipApplicationsRoutes from "@routes/membershipApplicationsRoutes";
import membershipsPublicRoutes from "@routes/membershipsPublicRoutes";
import membershipsRoutes from "@routes/membershipsRoutes";
import ordersRoutes from "@routes/ordersRoutes";
import productsRoutes from "@routes/productsRoutes";
import scholarshipsApplicationsRoutes from "@routes/scholarshipApplicationsRoutes";
import scholarshipsPublicRoutes from "@routes/scholarshipsPublicRoutes";
import scholarshipsRoutes from "@routes/scholarshipsRoutes";
import settingsRoutes from "@routes/settingsRoutes";

dotenv.config({ override: true });

const app = express();

/* =========================================================
   SECURITY — Helmet Middleware
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
    crossOriginEmbedderPolicy: false,
  })
);

/* =========================================================
   CORS
   ========================================================= */
app.use(
  cors({
    origin: ["https://zonta-club-x9jt.vercel.app/"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

/* =========================================================
   Stripe Webhook
   ========================================================= */
app.post(
  "/api/checkout/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleStripeWebhook
);

/* =========================================================
   JSON Parsing + Rate Limiting
   ========================================================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json());
app.use("/api", adminLimiter);

/* =========================================================
   Serve Receipts
   ========================================================= */
const receiptsDir = path.resolve("receipts");
fs.ensureDirSync(receiptsDir);
app.use("/receipts", express.static(receiptsDir));

/* =========================================================
   PUBLIC API ROUTES  (NO AUTH)
   ========================================================= */
app.use("/api/auth", authRoutes);
app.use("/api/public/memberships", membershipsPublicRoutes); // 🔥 correct mount
app.use("/api/scholarships", scholarshipsPublicRoutes); // public scholarships
app.use("/api/products", productsRoutes);

/* =========================================================
ADMIN API ROUTES (PROTECTED)
========================================================= */
app.use("/api/admin/orders", ordersRoutes);
app.use("/api/admin/categories", categoriesRoutes);
app.use("/api/admin/events", eventsRoutes);
app.use("/api/admin/products", productsRoutes);
app.use("/api/admin/scholarships", scholarshipsRoutes);
app.use("/api/admin/scholarship-applications", scholarshipsApplicationsRoutes);
app.use("/api/admin/settings", settingsRoutes);
app.use("/api/admin/memberships", membershipsRoutes); // admin memberships
app.use("/api/admin/membership-applications", membershipApplicationsRoutes);
app.use("/api/admin/leadership", leadershipRoutes);
app.use("/api/admin/donations", donationsRoutes);

app.use("/api/checkout", checkoutRoutes);

/* =========================================================
   ROOT ROUTE
   ========================================================= */
app.get("/", (_req: Request, res: Response) => {
  res.send("Zonta Admin Backend running securely at /api/admin/*");
});

/* =========================================================
   404 Handler
   ========================================================= */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/* =========================================================
   ERROR HANDLER
   ========================================================= */
app.use(
  errorHandler as unknown as (err: any, req: Request, res: Response, next: NextFunction) => void
);

/* =========================================================
   ADMIN INFO LOGGING
   ========================================================= */
const adminsPath = path.resolve("src/config/admins.json");
let adminCount = 0;
try {
  if (fs.existsSync(adminsPath)) {
    const adminsData = JSON.parse(fs.readFileSync(adminsPath, "utf-8"));
    adminCount = Array.isArray(adminsData) ? adminsData.length : 0;
  }
} catch (err) {
  console.warn("Could not read admins.json:", err);
}

/* =========================================================
   DEBUG ROUTE LISTING
   ========================================================= */
function logRegisteredRoutes(app: express.Application) {
  if (!app._router || !app._router.stack) {
    console.warn("No routes found or Express router not initialized yet.");
    return;
  }

  console.log("\nRegistered routes:");
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
   START SERVER
   ========================================================= */
const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log("==========================================");
  console.log(`Sanity project: ${process.env.SANITY_PROJECT_ID}`);
  console.log(`Admin count: ${adminCount}`);
  console.log(`Server running at http://localhost:${PORT}`);
  console.log("==========================================");

  setTimeout(() => logRegisteredRoutes(app), 250);

  // Clean up unpaid membership applications on server start
  cleanupUnpaidApplications();

  // Run cleanup every 6 hours (21,600,000 ms)
  setInterval(
    () => {
      console.log("🧹 Running scheduled cleanup of unpaid membership applications...");
      cleanupUnpaidApplications();
    },
    6 * 60 * 60 * 1000
  );
});

export default app;
