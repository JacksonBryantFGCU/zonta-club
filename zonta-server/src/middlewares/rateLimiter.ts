// zonta-server/src/middlewares/rateLimiter.ts

import rateLimit from "express-rate-limit";

// General API limiter — moderate limit for public endpoints
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." },
});

// Stricter limiter for admin-only routes
export const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // 20 requests/minute for admin
  message: { error: "Too many admin requests, please slow down." },
});