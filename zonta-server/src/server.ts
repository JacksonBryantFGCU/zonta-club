// zonta-server/server.ts

import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";

import { handleStripeWebhook } from "./controllers/checkoutController.js";
import { cleanupUnpaidApplications } from "./controllers/membershipApplicationsController.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { adminLimiter } from "./middlewares/rateLimiter.js";
import authRoutes from "./routes/authRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import donationsRoutes from "./routes/donationsRoutes.js";
import eventsRoutes from "./routes/eventsRoutes.js";
import leadershipRoutes from "./routes/leadershipRoutes.js";
import membershipApplicationsRoutes from "./routes/membershipApplicationsRoutes.js";
import membershipsPublicRoutes from "./routes/membershipsPublicRoutes.js";
import membershipsRoutes from "./routes/membershipsRoutes.js";
import scholarshipsApplicationsRoutes from "./routes/scholarshipApplicationsRoutes.js";
import scholarshipsPublicRoutes from "./routes/scholarshipsPublicRoutes.js";
import scholarshipsRoutes from "./routes/scholarshipsRoutes.js";
import settingsRoutes, { publicSettingsRouter } from "./routes/settingsRoutes.js";

dotenv.config({ override: true });

const app = express();
app.set("trust proxy", 1);

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
const CORS_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : [
      "http://localhost:5173",
      "https://zonta-club-x9jt.vercel.app",
      "https://www.zontaclubofnaples.org",
      "https://zontaclubofnaples.org",
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, Postman)
      if (!origin) return callback(null, true);
      if (CORS_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
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
   PUBLIC API ROUTES  (NO AUTH)
   ========================================================= */
app.use("/api/auth", authRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/public/memberships", membershipsPublicRoutes); // 🔥 correct mount
app.use("/api/public/settings", publicSettingsRouter);
app.use("/api/scholarships", scholarshipsPublicRoutes); // public scholarships

/* =========================================================
ADMIN API ROUTES (PROTECTED)
========================================================= */
app.use("/api/admin/events", eventsRoutes);
app.use("/api/admin/scholarships", scholarshipsRoutes);
app.use("/api/admin/scholarship-applications", scholarshipsApplicationsRoutes);
app.use("/api/admin/settings", settingsRoutes);
app.use("/api/admin/memberships", membershipsRoutes); // admin memberships
app.use("/api/admin/membership-applications", membershipApplicationsRoutes);
app.use("/api/admin/leadership", leadershipRoutes);
app.use("/api/admin/donations", donationsRoutes);

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
