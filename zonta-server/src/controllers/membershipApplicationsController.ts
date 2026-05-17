// zonta-server/src/controllers/membershipApplicationsController.ts

import type { Request, Response } from "express";

import { sanityClient } from "../services/sanityService.js";

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
export const updateMembershipApplicationStatus = async (req: Request, res: Response) => {
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
 * @desc Clean up old unpaid membership applications (older than 24 hours).
 *       Membership dues are now paid by mailed check. This cleanup removes
 *       stale pending applications that were never completed.
 */
export const cleanupUnpaidApplications = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Remove unpaid applications older than 24 hours
    // stripeSessionId filter kept so historical records with a session ID are
    // still eligible for cleanup if they were never paid.
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
      console.log("No stale unpaid applications to clean up");
      return;
    }

    console.log(`Cleaning up ${unpaidApps.length} unpaid applications...`);

    for (const app of unpaidApps) {
      await sanityClient.delete(app._id);
    }

    console.log(`Deleted ${unpaidApps.length} unpaid membership applications`);
  } catch (err) {
    console.error("Failed to clean up unpaid applications:", err);
  }
};
