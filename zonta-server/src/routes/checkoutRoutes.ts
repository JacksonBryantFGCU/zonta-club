// zonta-server/src/routes/checkoutRoutes.ts

import { Router } from "express";

import { createCheckoutSession, handleStripeWebhook } from "@controllers/checkoutController";

const router = Router();

/**
 * @route POST /api/checkout/webhook
 * @desc Stripe webhook endpoint (must use raw body)
 */
router.post("/webhook", handleStripeWebhook);

/**
 * @route POST /api/checkout/create-session
 * @desc Create a new Stripe Checkout session
 */
router.post("/create-session", createCheckoutSession);

export default router;
