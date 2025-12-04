// zonta-server/src/routes/membershipsPublicRoutes.ts

import express from "express";
import {
  getPublicMemberships,
  submitMembershipApplication,
} from "@controllers/membershipsPublicController";
import { sanityClient } from "@services/sanityService";

const router = express.Router();

/**
 * @route GET /api/public/memberships
 * @desc Get all active memberships (public)
 */
router.get("/", getPublicMemberships);

/**
 * @route GET /api/public/memberships/:id
 * @desc Get a single membership by ID (public)
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = `*[_type == "membership" && _id == $id][0]{
      _id,
      title,
      price,
      description,
      benefits,
      duration
    }`;

    const membership = await sanityClient.fetch(query, { id });

    if (!membership) {
      return res.status(404).json({ error: "Membership not found" });
    }

    res.status(200).json(membership);
  } catch (err) {
    console.error("Failed to fetch public membership:", err);
    res.status(500).json({ error: "Failed to fetch public membership" });
  }
});

/**
 * @route POST /api/public/memberships/apply
 * @desc Submit membership application + Stripe checkout
 */
router.post("/apply", submitMembershipApplication);

export default router;