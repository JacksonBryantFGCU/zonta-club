import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

console.log("✅ Stripe key loaded:", !!process.env.STRIPE_SECRET_KEY);

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});