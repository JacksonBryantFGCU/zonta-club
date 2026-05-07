// zonta-server/src/routes/checkoutRoutes.ts

import { Router } from "express";

import { createDonationSession } from "../controllers/checkoutController.js";

const router = Router();

/**
 * @route POST /api/checkout/donation-session
 * @desc  Create a Stripe Checkout session for a one-time donation
 */
router.post("/donation-session", createDonationSession);

export default router;
