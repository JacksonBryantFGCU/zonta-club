// zonta-server/src/services/onlineDonationService.ts
// Sanity persistence layer for Square online donation records.
//
// SECURITY: This module must NEVER receive or store:
//   - sourceId / Square nonce tokens
//   - Square access tokens
//   - Raw card data or CVVs
//
// The Square payment ID (squarePaymentId) is safe to store — it is a
// server-side identifier that does not grant any payment authority.

import { sanityClient } from "../utils/sanityClient.js";
import type { OneTimeDonationInput, RecurringDonationInput } from "../validation/donationValidation.js";
import type { PaymentResult, CustomerResult, SubscriptionResult } from "./squareDonationService.js";

// ── Types ──────────────────────────────────────────────────────────────────

export interface OnlineDonationRecord {
  _id: string;
  // one-time payment fields
  squarePaymentId?: string | null;
  squareStatus?: string | null;
  receiptUrl?: string | null;
  // recurring subscription fields
  squareSubscriptionId?: string | null;
  squareCustomerId?: string | null;
  subscriptionStatus?: string | null;
  cadence?: string | null;
  authorizationAccepted?: boolean | null;
  startedAt?: string | null;
  // shared
  amountCents: number;
  currency: string;
  giftType: string;
  givingLevel: string;
  donorFirstName: string;
  donorLastName: string;
  donorEmail: string;
  donorPhone?: string | null;
  donorStreetAddress?: string | null;
  donorCity?: string | null;
  donorState?: string | null;
  donorZip?: string | null;
  tributeEnabled: boolean;
  tributeType?: string | null;
  honoreeName?: string | null;
  notificationName?: string | null;
  notificationEmail?: string | null;
  notificationAddress?: string | null;
  tributeMessage?: string | null;
  paymentProcessor: string;
  environment: string;
  createdAt: string;
}

// ── createOnlineDonationRecord ─────────────────────────────────────────────

/**
 * Saves a record of a successful Square payment to Sanity.
 *
 * Called fire-and-forget from the payment controller — a Sanity failure
 * does NOT prevent the donor from receiving their success response.
 *
 * TODO: Add retry logic or a Square webhook handler to reconcile any
 * records that failed to save here (e.g. if Sanity was temporarily down).
 */
export async function createOnlineDonationRecord(
  payment: PaymentResult,
  input: OneTimeDonationInput,
  amountCents: number,
  environment: string
): Promise<void> {
  const tribute = input.tribute;

  const doc = {
    _type: "onlineDonation",
    squarePaymentId: payment.paymentId,
    squareStatus: payment.status,
    receiptUrl: payment.receiptUrl ?? null,
    amountCents,
    currency: "USD",
    giftType: input.giftType,
    givingLevel: input.givingLevel,
    donorFirstName: input.donor.firstName,
    donorLastName: input.donor.lastName,
    donorEmail: input.donor.email,
    donorPhone: input.donor.phone ?? null,
    donorStreetAddress: input.donor.streetAddress ?? null,
    donorCity: input.donor.city ?? null,
    donorState: input.donor.state ?? null,
    donorZip: input.donor.zip ?? null,
    tributeEnabled: tribute?.show ?? false,
    tributeType: tribute?.type ?? null,
    honoreeName: tribute?.honoreeName ?? null,
    notificationName: tribute?.notificationName ?? null,
    notificationEmail: tribute?.notificationEmail ?? null,
    notificationAddress: tribute?.notificationAddress ?? null,
    tributeMessage: tribute?.message ?? null,
    paymentProcessor: "square",
    environment,
    createdAt: new Date().toISOString(),
  };

  await sanityClient.create(doc);
}

// ── createRecurringDonationRecord ──────────────────────────────────────────

/**
 * Saves a record of a successful Square subscription to Sanity.
 * Called fire-and-forget — a Sanity failure does NOT fail the donor response.
 */
export async function createRecurringDonationRecord(
  subscription: SubscriptionResult,
  customer: CustomerResult,
  input: RecurringDonationInput,
  amountCents: number,
  environment: string
): Promise<void> {
  const tribute = input.tribute;

  const doc = {
    _type: "onlineDonation",
    squareSubscriptionId: subscription.subscriptionId,
    squareCustomerId: customer.customerId,
    subscriptionStatus: subscription.status ?? "ACTIVE",
    cadence: "monthly",
    authorizationAccepted: true,
    startedAt: new Date().toISOString(),
    amountCents,
    currency: "USD",
    giftType: "monthly",
    givingLevel: input.givingLevel,
    donorFirstName: input.donor.firstName,
    donorLastName: input.donor.lastName,
    donorEmail: input.donor.email,
    donorPhone: input.donor.phone ?? null,
    donorStreetAddress: input.donor.streetAddress ?? null,
    donorCity: input.donor.city ?? null,
    donorState: input.donor.state ?? null,
    donorZip: input.donor.zip ?? null,
    tributeEnabled: tribute?.show ?? false,
    tributeType: tribute?.type ?? null,
    honoreeName: tribute?.honoreeName ?? null,
    notificationName: tribute?.notificationName ?? null,
    notificationEmail: tribute?.notificationEmail ?? null,
    notificationAddress: tribute?.notificationAddress ?? null,
    tributeMessage: tribute?.message ?? null,
    paymentProcessor: "square",
    environment,
    createdAt: new Date().toISOString(),
  };

  await sanityClient.create(doc);
}

// ── listOnlineDonationRecords ──────────────────────────────────────────────

// Allowed filter values — validated to prevent GROQ injection via string fields.
const VALID_STATUSES = new Set(["COMPLETED", "FAILED", "PENDING", "APPROVED", "CANCELED"]);
const VALID_LEVELS = new Set(["bronze", "silver", "gold", "platinum", "other"]);
const VALID_ENVS = new Set(["sandbox", "production"]);
const VALID_GIFT_TYPES = new Set(["one-time", "monthly"]);

interface ListOptions {
  limit?: number;
  status?: string;
  givingLevel?: string;
  environment?: string;
  giftType?: string;
}

export async function listOnlineDonationRecords(
  options: ListOptions = {}
): Promise<OnlineDonationRecord[]> {
  const safeLimit = Math.max(1, Math.min(500, options.limit ?? 100));

  const conditions: string[] = ['_type == "onlineDonation"'];
  // Use Sanity parameterized queries for string filters to avoid GROQ injection.
  const params: Record<string, string> = {};

  if (options.status && VALID_STATUSES.has(options.status)) {
    conditions.push("squareStatus == $status");
    params.status = options.status;
  }
  if (options.givingLevel && VALID_LEVELS.has(options.givingLevel)) {
    conditions.push("givingLevel == $givingLevel");
    params.givingLevel = options.givingLevel;
  }
  if (options.environment && VALID_ENVS.has(options.environment)) {
    conditions.push("environment == $env");
    params.env = options.environment;
  }
  if (options.giftType && VALID_GIFT_TYPES.has(options.giftType)) {
    conditions.push("giftType == $giftType");
    params.giftType = options.giftType;
  }

  // safeLimit is a validated integer, safe to interpolate.
  const query = `*[${conditions.join(" && ")}] | order(createdAt desc) [0...${safeLimit}] {
    _id,
    squarePaymentId,
    squareStatus,
    receiptUrl,
    squareSubscriptionId,
    squareCustomerId,
    subscriptionStatus,
    cadence,
    authorizationAccepted,
    startedAt,
    amountCents,
    currency,
    giftType,
    givingLevel,
    donorFirstName,
    donorLastName,
    donorEmail,
    donorPhone,
    donorStreetAddress,
    donorCity,
    donorState,
    donorZip,
    tributeEnabled,
    tributeType,
    honoreeName,
    notificationName,
    notificationEmail,
    notificationAddress,
    tributeMessage,
    paymentProcessor,
    environment,
    createdAt
  }`;

  return sanityClient.fetch<OnlineDonationRecord[]>(query, params);
}
