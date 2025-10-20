import { stripe } from "../utils/stripeClient.js";
import { sanityClient } from "../utils/sanityClient.js";

// ✅ Create checkout session
export const createCheckoutSession = async (req, res) => {
  console.log("📦 Incoming checkout session request:", req.body);
  try {
    const { items, email } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid items payload" });
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.title || "Zonta Product" },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      billing_address_collection: "auto",
      shipping_address_collection: { allowed_countries: ["US"] },
      shipping_options: [{ shipping_rate: process.env.STRIPE_SHIPPING_RATE }],
      customer_email: email,
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Checkout error:", err);
    res.status(500).json({ error: `Checkout creation failed: ${err.message}` });
  }
};

// ✅ Stripe Webhook handler
export const handleStripeWebhook = async (req, res) => {
  console.log("📬 Stripe Webhook received...");
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log("✅ Verified webhook event:", event.type);
  } catch (err) {
    console.error("❌ Webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("🧾 Checkout completed for:", session.customer_email);

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

      const orderData = {
        _type: "order",
        email: session.customer_email,
        total: session.amount_total / 100,
        items: lineItems.data.map((item) => ({
          _type: "orderItem",
          productName: item.description,
          quantity: item.quantity,
          price: item.amount_total / 100,
        })),
        shippingAddress: {
          line1: session.shipping_details?.address?.line1 || "",
          city: session.shipping_details?.address?.city || "",
          state: session.shipping_details?.address?.state || "",
          postal_code: session.shipping_details?.address?.postal_code || "",
        },
        status: "Pending",
        createdAt: new Date().toISOString(),
      };

      await sanityClient.create(orderData);
      console.log("✅ Order stored in Sanity");
    } catch (err) {
      console.error("❌ Error handling webhook:", err);
    }
  }

  res.json({ received: true });
};