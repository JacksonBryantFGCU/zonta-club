// zonta-server/src/controllers/checkoutController.ts

import type { Request, Response } from "express";
import Stripe from "stripe";

import { sanityClient } from "../utils/sanityClient.js";
import { stripe } from "../utils/stripeClient.js";

// ==========================================================
// Create a Stripe Checkout Session for a one-time donation
// ==========================================================
export const createDonationSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, title } = req.body as { amount: number; title?: string };

    if (!amount || typeof amount !== "number" || amount <= 0) {
      res.status(400).json({ error: "Invalid donation amount" });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: title ? `Donation: ${title}` : "Donation" },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/donate?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/donate`,
      metadata: { app: "zonta-donation" },
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error("createDonationSession error:", err);
    res.status(500).json({ error: `Donation checkout failed: ${err.message}` });
  }
};

// ==========================================================
// Stripe Webhook Handler — membership application payments
// ==========================================================
export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  console.log("⚡ Stripe webhook received...");
  const sig = req.headers["stripe-signature"] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.warn(" Missing Stripe signature or webhook secret");
    res.status(400).send("Missing Stripe signature or webhook secret");
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
    console.log(" Verified Stripe webhook event:", event.type);
  } catch (err: any) {
    console.error(" Webhook verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session & {
      payment_intent?: string | null;
    };
    const metadata = session.metadata || {};
    const sanityApplicationId = metadata.sanityApplicationId;

    if (sanityApplicationId) {
      console.log("💳 Processing membership application payment...");
      try {
        await sanityClient
          .patch(sanityApplicationId)
          .set({
            paid: true,
            stripeSessionId: session.id,
            paymentIntentId: session.payment_intent ?? null,
            paidAt: new Date().toISOString(),
          })
          .commit();

        console.log("✅ Membership application marked as paid:", sanityApplicationId);
      } catch (err) {
        console.error("❌ Error updating membership application:", err);
        res.status(500).json({ error: "Failed to update membership application" });
        return;
      }
    }
  }

  res.json({ received: true });
};
