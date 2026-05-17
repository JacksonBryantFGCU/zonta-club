// zonta-sanity/schemaTypes/onlineDonation.ts
// Schema for Square online donation transaction records.
// These documents are written by the backend after each successful payment.
// SECURITY: Never store sourceId, card tokens, or raw Square access tokens here.

import { defineType, defineField } from "sanity";

export default defineType({
  name: "onlineDonation",
  title: "Online Donations",
  type: "document",
  fields: [
    // ── Square payment info ────────────────────────────────────────────────
    defineField({
      name: "squarePaymentId",
      title: "Square Payment ID",
      type: "string",
      description: "One-time only: the payment ID returned by Square Payments API.",
    }),
    defineField({
      name: "squareStatus",
      title: "Payment Status",
      type: "string",
      description: "One-time only: Square payment status (COMPLETED, FAILED, PENDING, etc.).",
    }),
    defineField({
      name: "receiptUrl",
      title: "Receipt URL",
      type: "string",
      description: "Square-hosted receipt URL. Present for COMPLETED payments.",
    }),

    // ── Amount ────────────────────────────────────────────────────────────
    defineField({
      name: "amountCents",
      title: "Amount (cents)",
      type: "number",
      description: "Charged amount in cents (e.g. 5000 = $50.00).",
      validation: (Rule) => Rule.required().integer().min(1),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "USD",
    }),

    // ── Gift details ───────────────────────────────────────────────────────
    defineField({
      name: "giftType",
      title: "Gift Type",
      type: "string",
      description: "one-time for now; monthly when recurring is enabled.",
      initialValue: "one-time",
    }),
    defineField({
      name: "givingLevel",
      title: "Giving Level",
      type: "string",
      description: "bronze | silver | gold | platinum | other",
    }),

    // ── Donor information ─────────────────────────────────────────────────
    defineField({
      name: "donorFirstName",
      title: "First Name",
      type: "string",
    }),
    defineField({
      name: "donorLastName",
      title: "Last Name",
      type: "string",
    }),
    defineField({
      name: "donorEmail",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "donorPhone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "donorStreetAddress",
      title: "Street Address",
      type: "string",
    }),
    defineField({
      name: "donorCity",
      title: "City",
      type: "string",
    }),
    defineField({
      name: "donorState",
      title: "State",
      type: "string",
    }),
    defineField({
      name: "donorZip",
      title: "ZIP",
      type: "string",
    }),

    // ── Tribute gift ──────────────────────────────────────────────────────
    defineField({
      name: "tributeEnabled",
      title: "Tribute Gift",
      type: "boolean",
      description: "Whether this was a tribute gift.",
      initialValue: false,
    }),
    defineField({
      name: "tributeType",
      title: "Tribute Type",
      type: "string",
      description: "none | in-honor-of | in-memory-of",
    }),
    defineField({
      name: "honoreeName",
      title: "Honoree Name",
      type: "string",
    }),
    defineField({
      name: "notificationName",
      title: "Notification Recipient",
      type: "string",
    }),
    defineField({
      name: "notificationEmail",
      title: "Notification Email",
      type: "string",
    }),
    defineField({
      name: "notificationAddress",
      title: "Notification Address",
      type: "text",
    }),
    defineField({
      name: "tributeMessage",
      title: "Tribute Message",
      type: "text",
    }),

    // ── Recurring subscription fields ─────────────────────────────────────
    defineField({
      name: "squareSubscriptionId",
      title: "Square Subscription ID",
      type: "string",
      description: "For monthly gifts: the Square Subscriptions API subscription ID.",
    }),
    defineField({
      name: "squareCustomerId",
      title: "Square Customer ID",
      type: "string",
      description: "For monthly gifts: the Square Customer ID used for the subscription.",
    }),
    defineField({
      name: "subscriptionStatus",
      title: "Subscription Status",
      type: "string",
      description: "For monthly gifts: Square subscription status (ACTIVE, CANCELED, etc.).",
    }),
    defineField({
      name: "cadence",
      title: "Cadence",
      type: "string",
      description: "For monthly gifts: billing cadence (monthly).",
    }),
    defineField({
      name: "authorizationAccepted",
      title: "Authorization Accepted",
      type: "boolean",
      description: "Whether the donor explicitly authorized recurring charges.",
      initialValue: false,
    }),
    defineField({
      name: "startedAt",
      title: "Subscription Started At",
      type: "datetime",
      description: "For monthly gifts: ISO datetime when the subscription was created.",
    }),

    // ── Metadata ──────────────────────────────────────────────────────────
    defineField({
      name: "paymentProcessor",
      title: "Payment Processor",
      type: "string",
      initialValue: "square",
    }),
    defineField({
      name: "environment",
      title: "Environment",
      type: "string",
      description: "sandbox | production — the Square environment this was charged in.",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      description: "Timestamp of the successful payment or subscription creation.",
      validation: (Rule) => Rule.required(),
    }),
  ],

  preview: {
    select: {
      donorFirstName: "donorFirstName",
      donorLastName: "donorLastName",
      amountCents: "amountCents",
      giftType: "giftType",
      squareStatus: "squareStatus",
      subscriptionStatus: "subscriptionStatus",
      createdAt: "createdAt",
    },
    prepare({ donorFirstName, donorLastName, amountCents, giftType, squareStatus, subscriptionStatus, createdAt }) {
      const name =
        [donorFirstName, donorLastName].filter(Boolean).join(" ") ||
        "Unknown Donor";
      const amount =
        typeof amountCents === "number"
          ? `$${(amountCents / 100).toFixed(2)}`
          : "";
      const isMonthly = giftType === "monthly";
      const status = isMonthly
        ? (subscriptionStatus ?? "ACTIVE")
        : (squareStatus ?? "");
      const suffix = isMonthly ? "/mo" : "";
      const date = createdAt
        ? new Date(createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "";
      return {
        title: `${name} — ${amount}${suffix}`,
        subtitle: `${status} · ${isMonthly ? "Monthly" : "One-time"} · ${date}`,
      };
    },
  },
});
