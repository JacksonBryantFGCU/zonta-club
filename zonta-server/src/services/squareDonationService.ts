// zonta-server/src/services/squareDonationService.ts
// Square Payments API + Subscriptions API helpers for donation processing.
// Square SDK v44: client.payments.create, client.customers, client.subscriptions.
//
// SECURITY: Never log sourceId, card tokens, or any PCI-sensitive values.

import type * as Square from "square";

import { getSquareClient, getSquareLocationId } from "../utils/squareClient.js";
import type { DonorInput } from "../validation/donationValidation.js";

// ── Types ──────────────────────────────────────────────────────────────────

export interface CreatePaymentInput {
  /** Square Web Payments SDK nonce — single-use, do not log. */
  sourceId: string;
  amountCents: number;
  donorEmail: string;
  donorName: string;
  /** Optional Square customer ID to associate with the payment. */
  customerId?: string;
  note?: string;
  referenceId?: string;
}

/**
 * Frontend-safe payment result.
 * BigInt fields from the Square SDK are deliberately excluded here —
 * never pass raw Money objects to res.json().
 */
export interface PaymentResult {
  paymentId: string;
  status: string;
  receiptUrl?: string;
}

export interface CustomerResult {
  customerId: string;
  givenName?: string;
  familyName?: string;
  emailAddress?: string;
}

export interface SubscriptionResult {
  subscriptionId: string;
  status?: string;
  startDate?: string;
}

// ── Helper ─────────────────────────────────────────────────────────────────

function idempotencyKey(): string {
  return crypto.randomUUID();
}

// ── createOneTimeDonationPayment ───────────────────────────────────────────

/**
 * Charges the donor's card via the Square Payments API.
 *
 * SECURITY: input.sourceId is a single-use nonce from Square Web Payments SDK.
 * Never log it. Never store it. It becomes invalid after this call.
 */
export async function createOneTimeDonationPayment(
  input: CreatePaymentInput
): Promise<PaymentResult> {
  const client = getSquareClient();
  const locationId = getSquareLocationId();

  const response = await client.payments.create({
    sourceId: input.sourceId,
    idempotencyKey: idempotencyKey(),
    amountMoney: {
      amount: BigInt(input.amountCents),
      currency: "USD",
    },
    locationId,
    buyerEmailAddress: input.donorEmail,
    note: input.note,
    referenceId: input.referenceId,
    // customerId is omitted for now; added when customer management is wired.
  });

  const p = response.payment;

  // Square may return a payment with status FAILED rather than throwing.
  if (!p?.id) {
    const squareErrors = response.errors;
    const detail = squareErrors?.[0]?.code ?? "no payment ID returned";
    throw new Error(`Square payment unsuccessful: ${detail}`);
  }

  if (p.status === "FAILED") {
    throw new Error("Square payment was declined or failed.");
  }

  return {
    paymentId: p.id,
    status: p.status ?? "COMPLETED",
    receiptUrl: p.receiptUrl,
  };
}

// ── createOrFindCustomerByEmail ────────────────────────────────────────────

/**
 * Looks up an existing Square customer by email address; creates one if absent.
 * Used to associate subscriptions with a persistent Square customer record.
 */
export async function createOrFindCustomerByEmail(
  donor: DonorInput
): Promise<CustomerResult> {
  const client = getSquareClient();

  // Search for an existing customer with this email to avoid duplicates.
  const searchResponse = await client.customers.search({
    query: {
      filter: {
        emailAddress: { exact: donor.email },
      },
    },
  });

  const existing = searchResponse.customers?.[0];
  if (existing?.id) {
    return {
      customerId: existing.id,
      givenName: existing.givenName ?? undefined,
      familyName: existing.familyName ?? undefined,
      emailAddress: existing.emailAddress ?? undefined,
    };
  }

  // No existing customer — create one.
  const createResponse = await client.customers.create({
    idempotencyKey: idempotencyKey(),
    givenName: donor.firstName,
    familyName: donor.lastName,
    emailAddress: donor.email,
    phoneNumber: donor.phone,
    address: donor.streetAddress
      ? {
          addressLine1: donor.streetAddress,
          locality: donor.city,
          administrativeDistrictLevel1: donor.state,
          postalCode: donor.zip,
          country: "US",
        }
      : undefined,
    referenceId: `zonta-${Date.now()}`,
  });

  const c = createResponse.customer;
  if (!c?.id) {
    throw new Error("Square customer creation returned no ID.");
  }

  return {
    customerId: c.id,
    givenName: c.givenName ?? undefined,
    familyName: c.familyName ?? undefined,
    emailAddress: c.emailAddress ?? undefined,
  };
}

// ── saveCustomerCard ───────────────────────────────────────────────────────

/**
 * Saves a payment card on file for a customer using the Square Cards API.
 * Required for recurring subscriptions so Square can auto-charge monthly.
 *
 * SECURITY: sourceId is a single-use Square Web Payments SDK nonce — never log it.
 *
 * @param customerId - Square customer ID.
 * @param sourceId   - Square Web Payments SDK nonce for the card to save.
 * @returns The saved card ID.
 */
export async function saveCustomerCard(
  customerId: string,
  sourceId: string // SECURITY: do not log this parameter
): Promise<string> {
  const client = getSquareClient();

  const response = await client.cards.create({
    idempotencyKey: idempotencyKey(),
    sourceId, // SECURITY: do not log
    card: { customerId },
  });

  const card = response.card;
  if (!card?.id) {
    throw new Error("Square card creation returned no ID.");
  }

  return card.id;
}

// ── createRecurringDonationSubscription ───────────────────────────────────

/**
 * Enrolls a customer in a monthly donation subscription.
 * Uses SQUARE_DONATION_PLAN_VARIATION_ID from env (must be pre-created in Square Catalog).
 * Uses priceOverrideMoney to support any donation amount against a STATIC $1.00 plan.
 *
 * @param customerId  - Square customer ID.
 * @param cardId      - Saved card ID from saveCustomerCard.
 * @param amountCents - Monthly donation amount in cents.
 */
export async function createRecurringDonationSubscription(
  customerId: string,
  cardId: string,
  amountCents: number
): Promise<SubscriptionResult> {
  const planVariationId = process.env.SQUARE_DONATION_PLAN_VARIATION_ID;
  if (!planVariationId) {
    throw new Error("SQUARE_DONATION_PLAN_VARIATION_ID is not configured.");
  }

  const client = getSquareClient();
  const locationId = getSquareLocationId();

  const response = await client.subscriptions.create({
    idempotencyKey: idempotencyKey(),
    locationId,
    planVariationId,
    customerId,
    cardId,
    startDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    priceOverrideMoney: {
      amount: BigInt(amountCents),
      currency: "USD",
    },
    source: { name: "Zonta Club of Naples" },
  });

  const sub = response.subscription;
  if (!sub?.id) {
    const squareErrors = response.errors;
    const detail = squareErrors?.[0]?.code ?? "no subscription ID returned";
    throw new Error(`Square subscription creation failed: ${detail}`);
  }

  return {
    subscriptionId: sub.id,
    status: sub.status,
    startDate: sub.startDate,
  };
}

// Re-export Square types used by callers
export type { Square };
