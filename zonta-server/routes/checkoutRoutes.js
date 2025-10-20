import express from "express";
import {
  createCheckoutSession,
  handleStripeWebhook,
} from "../controllers/checkoutController.js";

const router = express.Router();

// Stripe Webhook (raw body)
router.post("/webhook", handleStripeWebhook);

// Create Checkout Session
router.post("/create-session", createCheckoutSession);

export default router;