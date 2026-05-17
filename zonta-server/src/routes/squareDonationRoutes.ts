// zonta-server/src/routes/squareDonationRoutes.ts
// Mounted at: POST /api/checkout/square

import { Router } from "express";

import {
  processOneTimeDonation,
  processRecurringDonation,
} from "../controllers/squareDonationController.js";

const router = Router();

/**
 * @route POST /api/checkout/square/donation
 * @desc  Process a one-time donation via Square Payments API.
 *        Expects a Square Web Payments SDK nonce (sourceId) in the request body.
 */
router.post("/donation", processOneTimeDonation);

/**
 * @route POST /api/checkout/square/donation/recurring
 * @desc  Create a monthly recurring donation subscription via Square Subscriptions API.
 *        Requires SQUARE_DONATION_PLAN_VARIATION_ID to be configured.
 */
router.post("/donation/recurring", processRecurringDonation);

export default router;
