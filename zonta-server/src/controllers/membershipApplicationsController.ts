// zonta-server/src/controllers/membershipApplicationsController.ts

import type { Request, Response } from "express";
import Stripe from "stripe";

import { sanityClient } from "@services/sanityService.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

// Inline type — local only
interface MembershipApplication {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  membershipType?: { _ref: string; _type: "reference" };
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  paid?: boolean;
}

/**
 * @route GET /api/admin/membership-applications
 * @desc Get all membership applications (paid + unpaid)
 * @access Protected
 */
export const getMembershipApplications = async (_req: Request, res: Response) => {
  try {
    const query = `
      *[_type == "membershipApplication"] 
      | order(createdAt desc){
        _id, name, email, phone, message, status, createdAt, paid, paidAt,
        stripeSessionId, paymentIntentId,
        membershipType->{_id, title, price}
      }
    `;
    const applications = await sanityClient.fetch(query);
    res.status(200).json(applications);
  } catch (err) {
    console.error("Failed to fetch membership applications:", err);
    res.status(500).json({ error: "Failed to fetch membership applications" });
  }
};

/**
 * @route PATCH /api/admin/membership-applications/:id/status
 * @desc Update membership application status
 * @access Protected
 */
export const updateMembershipApplicationStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: MembershipApplication["status"] };

    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const updated = await sanityClient.patch(id).set({ status }).commit();
    res.status(200).json({ message: "Status updated", updated });
  } catch (err) {
    console.error("Failed to update membership application:", err);
    res.status(500).json({ error: "Failed to update membership application" });
  }
};

export const deleteMembershipApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await sanityClient.delete(id);
    res.status(200).json({ message: "Membership application deleted successfully" });
  } catch (err) {
    console.error("Failed to delete membership application:", err);
    res.status(500).json({ error: "Failed to delete membership application" });
  }
};

/**
 * @route POST /api/admin/membership-applications/:id/payment-link
 * @desc Generate a Stripe Checkout payment link for an approved application
 * @access Protected
 */
export const createMembershipPaymentLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch application + membership details
    const appQuery = `
      *[_type == "membershipApplication" && _id == $id][0]{
        _id,
        name,
        email,
        status,
        paid,
        membershipType->{_id, title, price}
      }
    `;
    const application = await sanityClient.fetch(appQuery, { id });

    if (!application) {
      res.status(404).json({ error: "Membership application not found" });
      return;
    }

    if (application.status === "rejected") {
      res.status(400).json({ error: "Cannot create payment link for a rejected application" });
      return;
    }

    if (!application.membershipType) {
      res.status(400).json({ error: "Application is not linked to a membership type" });
      return;
    }

    const membership = application.membershipType;
    if (typeof membership.price !== "number" || membership.price <= 0) {
      res.status(400).json({ error: "This membership does not have a valid price" });
      return;
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: application.email,
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
        sanityApplicationId: application._id,
        membershipId: membership._id,
        email: application.email,
      },
      success_url: `${process.env.FRONTEND_URL}/success?type=membership&session_id={CHECKOUT_SESSION_ID}&appId=${application._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/admin/memberships`,
    });

    // Store Stripe session ID on the application
    await sanityClient.patch(application._id).set({
      stripeSessionId: session.id,
    }).commit();

    res.status(200).json({
      message: "Payment link created successfully",
      checkoutUrl: session.url,
    });
  } catch (err) {
    console.error("Failed to create membership payment link:", err);
    res.status(500).json({ error: "Failed to create membership payment link" });
  }
};

/**
 * @desc Clean up unpaid membership applications older than 24 hours
 *      Only those that had a Stripe session created.
 */
export const cleanupUnpaidApplications = async () => {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString();

    // Only remove apps that had a Stripe session but never paid
    const query = `
      *[_type == "membershipApplication" 
        && paid == false 
        && defined(stripeSessionId) 
        && createdAt < $cutoffTime]{_id}
    `;
    const unpaidApps = await sanityClient.fetch(query, {
      cutoffTime: twentyFourHoursAgo,
    });

    if (unpaidApps.length === 0) {
      console.log("✅ No unpaid Stripe-linked applications to clean up");
      return;
    }

    console.log(`🧹 Cleaning up ${unpaidApps.length} unpaid applications...`);

    for (const app of unpaidApps) {
      await sanityClient.delete(app._id);
    }

    console.log(`✅ Deleted ${unpaidApps.length} unpaid membership applications`);
  } catch (err) {
    console.error("❌ Failed to clean up unpaid applications:", err);
  }
};