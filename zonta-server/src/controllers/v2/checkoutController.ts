import path from "path";

import { sendReceiptEmail } from "@services/emailService";
import type { Request, Response } from "express";
import fs from "fs-extra";
import Stripe from "stripe";

import { generateReceipt } from "@utils/generateReceipt";
import { sanityClient } from "@utils/sanityClient";
import { stripe } from "@utils/stripeClient";

// ---------- Interfaces ----------
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

// ------------------------------
// Create Checkout Session
// ------------------------------
export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  console.log("📦 Incoming checkout session request:", req.body);
  try {
    const { items, email } = req.body as { items: CheckoutItem[]; email: string };

    if (!items || !Array.isArray(items) || items.length === 0) {
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

    const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [];
    if (process.env.STRIPE_SHIPPING_RATE) {
      shippingOptions.push({ shipping_rate: process.env.STRIPE_SHIPPING_RATE });
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

    res.json({ url: session.url });
  } catch (err: any) {
    console.error("❌ Checkout error:", err);
    res.status(500).json({ error: `Checkout creation failed: ${err.message}` });
  }
};

// ------------------------------
// Stripe Webhook Handler
// ------------------------------
export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  console.log("📬 Stripe Webhook received...");
  const sig = req.headers["stripe-signature"] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    res.status(400).send("Missing Stripe signature or webhook secret");
    return;
  }

  let event: Stripe.Event;
  try {
    // req.body is a Buffer (see bodyParser.raw in server.ts)
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
    console.log("✅ Verified webhook event:", event.type);
  } catch (err: any) {
    console.error("❌ Webhook verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    // ✅ Extend type to include additional fields returned by Stripe webhook
    type ExtendedSession = Stripe.Checkout.Session & {
      shipping_details?: {
        address?: {
          line1?: string;
          city?: string;
          state?: string;
          postal_code?: string;
        };
      };
      amount_total?: number;
      payment_intent?: string | null;
    };

    const session = event.data.object as ExtendedSession;
    const email = session.customer_email ?? "";
    const customerName = session.customer_details?.name ?? "Valued Customer";
    const createdAtISO = new Date().toISOString();

    console.log("🧾 Checkout completed for:", email, "session:", session.id);

    try {
      // 1️⃣ Retrieve line items
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

      // 2️⃣ Build order data (normalize nullable fields)
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

      // 3️⃣ Save to Sanity
      const createdOrder = await sanityClient.create(orderData);
      console.log("✅ Order stored in Sanity:", createdOrder._id);

      // 4️⃣ Build object for PDF receipt
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

      // 5️⃣ Generate PDF receipt
      const pdfPath = await generateReceipt(orderForPdf);
      console.log(`📄 Receipt generated: ${pdfPath}`);

      // 6️⃣ Upload receipt to Sanity
      try {
        const fileBuffer = await fs.readFile(pdfPath);
        const asset = await sanityClient.assets.upload("file", fileBuffer, {
          filename: path.basename(pdfPath),
          contentType: "application/pdf",
        });

        await sanityClient
          .patch(createdOrder._id)
          .set({ receipt: { _type: "file", asset: { _ref: asset._id } } })
          .commit();

        console.log("📎 Receipt file uploaded and linked to order in Sanity");
      } catch (uploadErr) {
        console.error("❌ Error uploading receipt to Sanity:", uploadErr);
      }

      // 7️⃣ Email receipt to customer
      try {
        if (email) {
          await sendReceiptEmail(email, pdfPath, createdOrder._id, orderForPdf);
        } else {
          console.warn("⚠️ No customer email present on session; skipping email send.");
        }
      } catch (emailErr) {
        console.error("❌ Error sending receipt email:", emailErr);
      }

      // 8️⃣ Cleanup temporary PDF
      setTimeout(async () => {
        try {
          await fs.remove(pdfPath);
          console.log(`🧹 Deleted temporary receipt: ${pdfPath}`);
        } catch (cleanupErr) {
          console.warn("⚠️ Failed to delete temp receipt:", cleanupErr);
        }
      }, 30_000);
    } catch (err) {
      console.error("❌ Error handling checkout session:", err);
    }
  }

  res.json({ received: true });
};
