import express from "express";
import cors from "cors";
import Stripe from "stripe";
import dotenv from "dotenv";
import bodyParser from "body-parser"; // ✅ Needed for raw webhook parsing

dotenv.config({ override: true });

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// ✅ CORS Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  })
);

// ========================
// 🔔 STRIPE WEBHOOK ROUTE
// ========================
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("📬 Webhook received...");

    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      console.log("✅ Webhook signature verified!");
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("📩 Stripe Event Type:", event.type);

    // ✅ Handle completed checkout sessions
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("🧾 Received checkout.session.completed for:", session.customer_email);

      try {
        // Retrieve line items
        console.log("📦 Fetching line items for session:", session.id);
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
        console.log("📦 Line items fetched:", lineItems.data.length);

        // ✅ Prepare order data
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

        console.log("📤 Sending order data to Sanity:", JSON.stringify(orderData, null, 2));

        console.log("🔑 Using Sanity Project:", process.env.VITE_SANITY_PROJECT_ID);
        console.log("🗂️ Using Dataset:", process.env.VITE_SANITY_DATASET);
        console.log("🪪 Token exists:", !!process.env.SANITY_WRITE_TOKEN);

        // ✅ Send order to Sanity
        const sanityResponse = await fetch(
          `https://${process.env.VITE_SANITY_PROJECT_ID}.api.sanity.io/v2023-10-16/data/mutate/${process.env.VITE_SANITY_DATASET}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.SANITY_WRITE_TOKEN}`,
            },
            body: JSON.stringify({ mutations: [{ create: orderData }] }),
          }
        );

        if (sanityResponse.ok) {
          console.log(`🎉 Order stored in Sanity for ${session.customer_email}`);
        } else {
          const errorText = await sanityResponse.text();
          console.error("⚠️ Failed to store order in Sanity:", errorText);
        }
      } catch (err) {
        console.error("❌ Error handling webhook event:", err);
      }
    }

    res.json({ received: true });
  }
);

// ✅ After webhook setup, allow express.json() for normal routes
app.use(express.json());

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ Zonta backend with Stripe webhook + shipping running!");
});

// ✅ Checkout route with shipping + email
app.post("/create-checkout-session", async (req, res) => {
  console.log("📦 Incoming checkout:", req.body);
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
      shipping_options: [{ shipping_rate: "shr_1SIbEY2KecobvtNvxlGZSw3T" }],
      customer_email: email,
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
    });

    console.log("✅ Stripe session created with shipping:", session.id);
    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Checkout error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start server
app.listen(4000, () => console.log("✅ Server running at http://localhost:4000"));