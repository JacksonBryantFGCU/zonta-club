// zonta-server/src/controllers/checkoutController.ts

import path from "path";

import type { Request, Response } from "express";
import fs from "fs-extra";
import Stripe from "stripe";

import { sendReceiptEmail } from "@services/emailService";
import { generateReceipt } from "@utils/generateReceipt";
import { sanityClient } from "@utils/sanityClient";
import { stripe } from "@utils/stripeClient";

interface CheckoutItem {
  title: string;
  price: number;
  quantity: number;
}

interface OrderItem {
  _type: "orderItem";
  productName: string;
  quantity: number;
  price: number;
}

interface OrderForPdf {
  _id: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  total: number;
  items: {
    title: string;
    quantity: number;
    price: number;
  }[];
}

// ==========================================================
// Create Checkout Session
// ==========================================================
export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  console.log("🛒 Incoming checkout session request:", req.body);

  try {
    const { items, email } = req.body as { items: CheckoutItem[]; email: string };

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.warn(" Invalid items payload");
      res.status(400).json({ error: "Invalid items payload" });
      return;
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.title || "Zonta Product" },
        unit_amount: Math.round(Number(item.price || 0) * 100),
      },
      quantity: Number(item.quantity || 1),
    }));

    console.log(" Stripe line items built:", lineItems.length);

    const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [];
    if (process.env.STRIPE_SHIPPING_RATE) {
      shippingOptions.push({ shipping_rate: process.env.STRIPE_SHIPPING_RATE });
      console.log("🚚 Added shipping rate:", process.env.STRIPE_SHIPPING_RATE);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      billing_address_collection: "auto",
      shipping_address_collection: { allowed_countries: ["US"] },
      ...(shippingOptions.length ? { shipping_options: shippingOptions } : {}),
      customer_email: email,
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      metadata: { app: "zonta-store" },
    });

    console.log(" Stripe checkout session created:", session.id);
    res.json({ url: session.url });
  } catch (err: any) {
    console.error(" Checkout error:", err);
    res.status(500).json({ error: `Checkout creation failed: ${err.message}` });
  }
};

// ==========================================================
// Stripe Webhook Handler
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
    console.log("🎉 Checkout session completed event detected.");

    type ExtendedSession = Stripe.Checkout.Session & {
      shipping_details?: {
        address?: { line1?: string; city?: string; state?: string; postal_code?: string };
      };
      amount_total?: number;
      payment_intent?: string | null;
    };

    const session = event.data.object as ExtendedSession;
    const email = session.customer_email ?? "";
    const customerName = session.customer_details?.name ?? "Valued Customer";
    const createdAtISO = new Date().toISOString();

    console.log(`👤 Customer: ${customerName}, 📧 Email: ${email}`);

    try {
      console.log("📦 Retrieving Stripe line items...");
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
      console.log(" Line items retrieved:", lineItems.data.length);

      const orderData = {
        _type: "order",
        email,
        customerName,
        total: (session.amount_total || 0) / 100,
        items: lineItems.data.map(
          (li): OrderItem => ({
            _type: "orderItem",
            productName: li.description ?? "Zonta Product",
            quantity: li.quantity ?? 1,
            price: (li.amount_total || 0) / 100,
          })
        ),
        shippingAddress: {
          line1: session.shipping_details?.address?.line1 ?? "",
          city: session.shipping_details?.address?.city ?? "",
          state: session.shipping_details?.address?.state ?? "",
          postal_code: session.shipping_details?.address?.postal_code ?? "",
        },
        status: "Paid",
        createdAt: createdAtISO,
        stripeSessionId: session.id,
        paymentIntentId: session.payment_intent ?? null,
      };

      console.log("🧾 Creating order in Sanity...");
      const createdOrder = await sanityClient.create(orderData);
      console.log(" Order stored in Sanity:", createdOrder._id);

      const orderForPdf: OrderForPdf = {
        _id: createdOrder._id,
        customerName,
        customerEmail: email,
        createdAt: createdAtISO,
        total: orderData.total,
        items: orderData.items.map((it) => ({
          title: it.productName,
          quantity: it.quantity,
          price: it.price,
        })),
      };

      console.log("🖨️ Generating PDF receipt...");
      const pdfPath = await generateReceipt(orderForPdf);
      console.log(" Receipt generated:", pdfPath);

      try {
        console.log("📤 Uploading receipt to Sanity...");
        const fileBuffer = await fs.readFile(pdfPath);
        const asset = await sanityClient.assets.upload("file", fileBuffer, {
          filename: path.basename(pdfPath),
          contentType: "application/pdf",
        });

        await sanityClient
          .patch(createdOrder._id)
          .set({ receipt: { _type: "file", asset: { _ref: asset._id } } })
          .commit();

        console.log(" Receipt uploaded to Sanity.");
      } catch (uploadErr) {
        console.error(" Error uploading receipt to Sanity:", uploadErr);
      }

      try {
        console.log("📧 Sending receipt email to:", email);
        await sendReceiptEmail(email, pdfPath, createdOrder._id, orderForPdf);
        console.log(" Receipt email sent to:", email);
      } catch (emailErr) {
        console.error(" Error sending receipt email:", emailErr);
      }

      console.log("🧹 Cleaning up temporary receipt file...");
      setTimeout(async () => {
        try {
          await fs.remove(pdfPath);
          console.log(`🧾 Deleted temporary file: ${pdfPath}`);
        } catch (cleanupErr) {
          console.warn(" Could not delete temp receipt:", cleanupErr);
        }
      }, 30_000);
    } catch (err) {
      console.error(" Error handling checkout session:", err);
    }
  }

  res.json({ received: true });
};
