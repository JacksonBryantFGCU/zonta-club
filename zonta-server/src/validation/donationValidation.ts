// zonta-server/src/validation/donationValidation.ts
// Zod schemas matching the shape expected from zonta-site/src/pages/Donate.tsx.
// Amounts are validated in cents; the server is authoritative for preset levels.

import { z } from "zod";

// ── Giving level → amount in cents (server-side authority) ────────────────

export const GIVING_LEVEL_AMOUNTS: Record<string, number> = {
  bronze: 5_000,    // $50.00
  silver: 10_000,   // $100.00
  gold: 25_000,     // $250.00
  platinum: 50_000, // $500.00
};

export const GIVING_LEVELS = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "other",
] as const;

export type GivingLevel = (typeof GIVING_LEVELS)[number];

/**
 * Resolve the authoritative amount in cents.
 * For preset levels the server uses the fixed table above.
 * For "other" the client-supplied customAmountCents is used after validation.
 */
export function resolveAmountCents(
  givingLevel: GivingLevel,
  customAmountCents?: number
): number {
  if (givingLevel === "other") {
    if (customAmountCents === undefined || customAmountCents < 100) {
      throw new Error("Custom amount must be at least $1.00 (100 cents).");
    }
    return customAmountCents;
  }
  const cents = GIVING_LEVEL_AMOUNTS[givingLevel];
  if (!cents) throw new Error(`Unknown giving level: ${givingLevel}`);
  return cents;
}

// ── Sub-schemas ────────────────────────────────────────────────────────────

const donorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("A valid email address is required"),
  phone: z.string().min(1, "Phone number is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
});

const tributeSchema = z.object({
  show: z.boolean(),
  type: z.enum(["none", "in-honor-of", "in-memory-of"]),
  honoreeName: z.string().optional(),
  notificationName: z.string().optional(),
  notificationEmail: z.string().optional(),
  notificationAddress: z.string().optional(),
  message: z.string().optional(),
});

// ── One-time donation ──────────────────────────────────────────────────────

export const oneTimeDonationSchema = z
  .object({
    /** Nonce from Square Web Payments SDK — do NOT log this value. */
    sourceId: z.string().min(1, "Payment source token is required"),
    giftType: z.literal("one-time"),
    givingLevel: z.enum(GIVING_LEVELS),
    /** Required only when givingLevel === "other". Supplied in cents. */
    customAmountCents: z.number().int().min(100).optional(),
    donor: donorSchema,
    tribute: tributeSchema.optional(),
    paymentMethod: z.literal("online"),
  })
  .refine(
    (val) =>
      val.givingLevel !== "other" ||
      (val.customAmountCents !== undefined && val.customAmountCents >= 100),
    {
      message: "A custom amount of at least $1.00 is required",
      path: ["customAmountCents"],
    }
  )
  .refine(
    (val) =>
      !val.tribute?.show ||
      val.tribute.type === "none" ||
      Boolean(val.tribute.honoreeName?.trim()),
    {
      message: "Honoree name is required for tribute gifts",
      path: ["tribute", "honoreeName"],
    }
  );

// ── Recurring (monthly) donation ───────────────────────────────────────────

export const recurringDonationSchema = z
  .object({
    /** Nonce from Square Web Payments SDK — do NOT log this value. */
    sourceId: z.string().min(1, "Payment source token is required"),
    giftType: z.literal("monthly"),
    givingLevel: z.enum(GIVING_LEVELS),
    /** Required only when givingLevel === "other". Supplied in cents. */
    customAmountCents: z.number().int().min(100).optional(),
    donor: donorSchema,
    tribute: tributeSchema.optional(),
    paymentMethod: z.literal("online"),
    /** Must be explicitly true — the user checked the authorization checkbox. */
    monthlyAuthorized: z.literal(true),
  })
  .refine(
    (val) =>
      val.givingLevel !== "other" ||
      (val.customAmountCents !== undefined && val.customAmountCents >= 100),
    {
      message: "A custom amount of at least $1.00 is required",
      path: ["customAmountCents"],
    }
  )
  .refine(
    (val) =>
      !val.tribute?.show ||
      val.tribute.type === "none" ||
      Boolean(val.tribute.honoreeName?.trim()),
    {
      message: "Honoree name is required for tribute gifts",
      path: ["tribute", "honoreeName"],
    }
  );

// ── Inferred types ─────────────────────────────────────────────────────────

export type OneTimeDonationInput = z.infer<typeof oneTimeDonationSchema>;
export type RecurringDonationInput = z.infer<typeof recurringDonationSchema>;
export type DonorInput = z.infer<typeof donorSchema>;
export type TributeInput = z.infer<typeof tributeSchema>;
