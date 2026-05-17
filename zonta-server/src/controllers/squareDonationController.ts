// zonta-server/src/controllers/squareDonationController.ts
// HTTP handlers for Square donation endpoints.
// SECURITY: Never log sourceId, card data, or access tokens.

import type { Request, Response } from "express";
import { SquareError } from "square";

import { isSquareConfigured } from "../utils/squareClient.js";
import {
  resolveAmountCents,
  oneTimeDonationSchema,
  recurringDonationSchema,
} from "../validation/donationValidation.js";
import {
  createOneTimeDonationPayment,
  createOrFindCustomerByEmail,
  saveCustomerCard,
  createRecurringDonationSubscription,
} from "../services/squareDonationService.js";
import {
  createOnlineDonationRecord,
  createRecurringDonationRecord,
} from "../services/onlineDonationService.js";
import {
  sendOneTimeDonationReceipt,
  sendRecurringDonationReceipt,
} from "../services/emailService.js";

// Categories that indicate a donor-side problem (card declined, bad CVV, etc.)
// Safe to surface as 400 so the frontend can prompt the donor to retry.
const PAYMENT_METHOD_CATEGORIES = new Set([
  "PAYMENT_METHOD_ERROR",
  "MERCHANT_SUBSCRIPTION_ERROR",
]);

function classifySquareError(err: SquareError): {
  httpStatus: number;
  message: string;
} {
  const first = err.errors[0];
  const category = first?.category ?? "";
  const code = first?.code ?? "";

  if (PAYMENT_METHOD_CATEGORIES.has(category)) {
    return {
      httpStatus: 400,
      message:
        "Your payment was declined. Please check your card details and try again.",
    };
  }

  if (category === "INVALID_REQUEST_ERROR") {
    return {
      httpStatus: 400,
      message: "The payment request was invalid. Please try again.",
    };
  }

  // Log safe diagnostic fields only — never log sourceId, tokens, or card data.
  console.error("[Square] API error:", {
    statusCode: err.statusCode,
    category,
    code,
  });

  return {
    httpStatus: 502,
    message: "Payment processing failed. Please try again or mail a check.",
  };
}

// ── processOneTimeDonation ─────────────────────────────────────────────────

/**
 * POST /api/checkout/square/donation
 *
 * Validates the request, charges the donor's card via Square Payments API,
 * and returns a frontend-safe payment result.
 *
 * Request body: OneTimeDonationInput (see donationValidation.ts)
 * Response:     { success, paymentId, status, receiptUrl, amountCents, givingLevel }
 */
export const processOneTimeDonation = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!isSquareConfigured()) {
    res.status(503).json({
      error: "Square payments are not yet configured on this server.",
    });
    return;
  }

  // ── 1. Validate request body ──────────────────────────────────────────────
  const parsed = oneTimeDonationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid donation request",
      details: parsed.error.issues,
    });
    return;
  }

  const data = parsed.data;

  // ── 2. Resolve authoritative amount ──────────────────────────────────────
  let amountCents: number;
  try {
    amountCents = resolveAmountCents(data.givingLevel, data.customAmountCents);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid amount";
    res.status(400).json({ error: message });
    return;
  }

  // ── 3. Charge via Square Payments API ────────────────────────────────────
  try {
    const payment = await createOneTimeDonationPayment({
      sourceId: data.sourceId,
      amountCents,
      donorEmail: data.donor.email,
      donorName: `${data.donor.firstName} ${data.donor.lastName}`,
      note: `Zonta Club of Naples — ${data.givingLevel} — ${data.donor.email}`,
      referenceId: `zonta-${data.givingLevel}-${Date.now()}`,
    });

    // ── 4. Persist donation record in Sanity (fire-and-forget) ──────────────
    // A Sanity failure must never fail the donor's payment response.
    // TODO: Add Square webhook reconciliation to backfill records that fail here.
    const squareEnv = process.env.SQUARE_ENVIRONMENT ?? "sandbox";
    createOnlineDonationRecord(payment, data, amountCents, squareEnv).catch(
      (err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[Square] Failed to save donation record to Sanity:", msg);
      }
    );

    // ── 5. Send receipt email to donor (fire-and-forget) ─────────────────────
    // Only include Square's receipt URL in production — sandbox URLs return 404.
    sendOneTimeDonationReceipt({
      donorFirstName: data.donor.firstName,
      donorLastName: data.donor.lastName,
      donorEmail: data.donor.email,
      amountCents,
      givingLevel: data.givingLevel,
      paymentId: payment.paymentId,
      receiptUrl: squareEnv === "production" ? payment.receiptUrl : undefined,
    }).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Square] Failed to send donation receipt email:", msg);
    });

    // ── 6. Return frontend-safe response (no BigInt, no SDK internals) ──────
    // Only return Square's receipt URL in production — sandbox URLs return 404.
    res.json({
      success: true,
      paymentId: payment.paymentId,
      status: payment.status,
      receiptUrl: squareEnv === "production" ? (payment.receiptUrl ?? null) : null,
      amountCents,
      givingLevel: data.givingLevel,
    });
  } catch (err: unknown) {
    if (err instanceof SquareError) {
      const { httpStatus, message } = classifySquareError(err);
      res.status(httpStatus).json({ error: message });
    } else {
      const message = err instanceof Error ? err.message : "Unexpected error";
      console.error("[Square] processOneTimeDonation unexpected error:", message);
      res.status(502).json({
        error: "Payment processing failed. Please try again or mail a check.",
      });
    }
  }
};

// ── processRecurringDonation ───────────────────────────────────────────────

/**
 * POST /api/checkout/square/donation/recurring
 *
 * Creates a Square customer, saves their card on file, and enrolls them
 * in a monthly donation subscription via the Square Subscriptions API.
 *
 * Current status: returns 501 — requires SQUARE_DONATION_PLAN_VARIATION_ID
 * and a configured subscription plan in the Square Catalog.
 */
export const processRecurringDonation = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!isSquareConfigured()) {
    res.status(503).json({
      error: "Square payments are not yet configured on this server.",
    });
    return;
  }

  const parsed = recurringDonationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid recurring donation request",
      details: parsed.error.issues,
    });
    return;
  }

  const data = parsed.data;

  // ── 1. Check SQUARE_DONATION_PLAN_VARIATION_ID ──────────────────────────
  if (!process.env.SQUARE_DONATION_PLAN_VARIATION_ID) {
    res.status(503).json({
      error: "Monthly donations are not configured yet.",
    });
    return;
  }

  // ── 2. Resolve authoritative amount ────────────────────────────────────
  let amountCents: number;
  try {
    amountCents = resolveAmountCents(data.givingLevel, data.customAmountCents);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid amount";
    res.status(400).json({ error: message });
    return;
  }

  // ── 3. Create/find customer, save card, create subscription ────────────
  try {
    const customer = await createOrFindCustomerByEmail(data.donor);
    const cardId = await saveCustomerCard(customer.customerId, data.sourceId);
    const subscription = await createRecurringDonationSubscription(
      customer.customerId,
      cardId,
      amountCents
    );

    // ── 4. Persist to Sanity (fire-and-forget) ──────────────────────────
    // A Sanity failure must never fail the donor's subscription response.
    // TODO: Add Square webhook reconciliation to backfill records that fail here.
    const squareEnv = process.env.SQUARE_ENVIRONMENT ?? "sandbox";
    createRecurringDonationRecord(
      subscription,
      customer,
      data,
      amountCents,
      squareEnv
    ).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Square] Failed to save recurring donation record to Sanity:", msg);
    });

    // ── 5. Send receipt email to donor (fire-and-forget) ─────────────────
    sendRecurringDonationReceipt({
      donorFirstName: data.donor.firstName,
      donorLastName: data.donor.lastName,
      donorEmail: data.donor.email,
      amountCents,
      givingLevel: data.givingLevel,
      subscriptionId: subscription.subscriptionId,
    }).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Square] Failed to send recurring receipt email:", msg);
    });

    // ── 6. Return frontend-safe response ────────────────────────────────
    res.json({
      success: true,
      subscriptionId: subscription.subscriptionId,
      status: subscription.status ?? "ACTIVE",
      amountCents,
      givingLevel: data.givingLevel,
      customerId: customer.customerId,
    });
  } catch (err: unknown) {
    if (err instanceof SquareError) {
      const { httpStatus, message } = classifySquareError(err);
      res.status(httpStatus).json({ error: message });
    } else {
      const message = err instanceof Error ? err.message : "Subscription failed";
      console.error("[Square] processRecurringDonation error:", message);
      res.status(502).json({
        error: "Unable to set up your monthly donation. Please try again or mail a check.",
      });
    }
  }
};
