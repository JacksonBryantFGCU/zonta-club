// zonta-server/src/controllers/membershipsPublicController.ts

import type { Request, Response } from "express";
import { sanityClient } from "@services/sanityService";

export const submitMembershipApplication = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message, membershipId } = req.body;

    if (!name || !email || !membershipId) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // 1. Check for existing application for this membership + email
    const existingQuery = `
      *[_type == "membershipApplication" 
        && email == $email 
        && membershipType._ref == $membershipId
        && (status == "pending" || status == "approved")
      ][0]{_id, status}
    `;
    const existingApp = await sanityClient.fetch(existingQuery, {
      email,
      membershipId,
    });

    if (existingApp) {
      res.status(400).json({
        error:
          existingApp.status === "approved"
            ? "You are already an approved member for this membership type."
            : "You have already applied for this membership. Your application is pending review.",
      });
      return;
    }

    // 2. Create new Sanity membership application (no Stripe)
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

    res.status(201).json({
      message: "Application submitted successfully. The club will contact you with next steps.",
      applicationId: createdApp._id,
    });
  } catch (err) {
    console.error("Failed to submit membership application:", err);
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
    console.error("Failed to fetch memberships:", err);
    res.status(500).json({ error: "Failed to fetch memberships" });
  }
};