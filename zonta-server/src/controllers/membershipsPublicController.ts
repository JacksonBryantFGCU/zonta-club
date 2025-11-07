// zonta-server/src/controllers/membershipsPublicController.ts

import type { Request, Response } from "express";
import Stripe from "stripe";

import { sanityClient } from "@services/sanityService";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

export const submitMembershipApplication = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message, membershipId } = req.body;

    if (!name || !email || !membershipId) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    //  1. Check for existing membership application with same email
    const existingQuery = `*[_type == "membershipApplication" && email == $email && (status == "pending" || status == "approved")][0]{_id, status}`;
    const existingApp = await sanityClient.fetch(existingQuery, { email });

    if (existingApp) {
      res.status(400).json({
        error:
          existingApp.status === "approved"
            ? "You are already an approved member."
            : "You have already applied for membership. Your application is pending approval.",
      });
      return;
    }

    //  2. Create new Sanity membership application
    const applicationDoc = {
      _type: "membershipApplication",
      name,
      email,
      phone,
      message,
      membershipType: { _type: "reference", _ref: membershipId },
      status: "pending",
      paid: false,
      createdAt: new Date().toISOString(),
    };

    const createdApp = await sanityClient.create(applicationDoc);

    //  3. Fetch membership details for Stripe
    const membership = await sanityClient.fetch(
      `*[_type == "membership" && _id == $id][0]{title, price}`,
      { id: membershipId }
    );

    if (!membership) {
      res.status(404).json({ error: "Membership not found" });
      return;
    }

    //  4. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${membership.title} Membership`,
            },
            unit_amount: Math.round(membership.price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        sanityApplicationId: createdApp._id,
        membershipId,
        email,
      },
      success_url: `${process.env.FRONTEND_URL}/success?type=membership&session_id={CHECKOUT_SESSION_ID}&appId=${createdApp._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/membership-cancel`,
    });

    //  5. Respond with Stripe redirect
    res.status(201).json({
      message: "Application submitted successfully. Redirecting to checkout...",
      checkoutUrl: session.url,
      applicationId: createdApp._id,
    });
  } catch (err) {
    console.error(" Failed to submit membership application:", err);
    res.status(500).json({ error: "Failed to submit membership application" });
  }
};

export const getPublicMemberships = async (_req: Request, res: Response) => {
  try {
    const query = `*[_type == "membership" && isActive == true] | order(order asc){
      _id, title, price, description, benefits, duration
    }`;
    const memberships = await sanityClient.fetch(query);
    res.status(200).json(memberships);
  } catch (err) {
    console.error(" Failed to fetch memberships:", err);
    res.status(500).json({ error: "Failed to fetch memberships" });
  }
};
