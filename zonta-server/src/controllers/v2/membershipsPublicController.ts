import type { Request, Response } from "express";

import { sanityClient } from "@services/sanityService";

export const getPublicMemberships = async (_req: Request, res: Response) => {
  try {
    const query = `*[_type == "membership" && isActive == true] | order(order asc){
      _id, title, price, description, benefits, duration
    }`;
    const memberships = await sanityClient.fetch(query);
    res.status(200).json(memberships);
  } catch (err) {
    console.error("❌ Failed to fetch memberships:", err);
    res.status(500).json({ error: "Failed to fetch memberships" });
  }
};

export const submitMembershipApplication = async (req: Request, res: Response) => {
  try {
    const { name, email, message, membershipId } = req.body;
    if (!name || !email || !membershipId) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const doc = {
      _type: "membershipApplication",
      name,
      email,
      message,
      membershipType: { _type: "reference", _ref: membershipId },
      createdAt: new Date().toISOString(),
    };

    const created = await sanityClient.create(doc);
    res.status(201).json({ message: "✅ Application submitted", application: created });
  } catch (err) {
    console.error("❌ Failed to submit membership application:", err);
    res.status(500).json({ error: "Failed to submit membership application" });
  }
};