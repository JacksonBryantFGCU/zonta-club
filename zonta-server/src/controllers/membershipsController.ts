// zonta-server/src/controllers/membershipsController.ts

import type { Request, Response } from "express";

import {
  fetchDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
} from "@services/sanityService";
import { sanityClient } from "@services/sanityService";
import type { BaseDocument } from "@utils/types";

interface Membership extends BaseDocument {
  title: string;
  price: number;
  description?: string;
  benefits?: string[];
  duration?: number;
  isActive?: boolean;
  order?: number;
}
/**
 * @route GET /api/admin/memberships
 * @desc Get all memberships
 * @access Protected
 */
export const getMemberships = async (_req: Request, res: Response): Promise<void> => {
  try {
    const query = `*[_type == "membership"] | order(order asc){
      _id, title, price, description, benefits, duration, isActive, order
    }`;
    const memberships = await sanityClient.fetch(query);
    res.status(200).json(memberships);
  } catch (err) {
    console.error("Failed to fetch memberships:", err);
    res.status(500).json({ error: "Failed to fetch memberships" });
  }
};

export const getMembershipById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const membership = await fetchDocumentById<Membership>(id);
    if (!membership) {
      res.status(404).json({ error: "Membership not found" });
      return;
    }
    res.status(200).json(membership);
  } catch (err) {
    console.error("Failed to fetch membership:", err);
    res.status(500).json({ error: "Failed to fetch membership" });
  }
};

export const createMembership = async (req: Request, res: Response): Promise<void> => {
  try {
    const newMembership = await createDocument<Membership>("membership", req.body);
    res.status(201).json({
      message: "Membership created successfully",
      membership: newMembership,
    });
  } catch (err) {
    console.error("Failed to create membership:", err);
    res.status(500).json({ error: "Failed to create membership" });
  }
};

export const updateMembership = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await updateDocument<Membership>(id, req.body);
    res.status(200).json({ message: "Membership updated", membership: updated });
  } catch (err) {
    console.error("Failed to update membership:", err);
    res.status(500).json({ error: "Failed to update membership" });
  }
};

export const deleteMembership = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteDocument(id);
    res.status(200).json({ message: "Membership deleted successfully" });
  } catch (err) {
    console.error("Failed to delete membership:", err);
    res.status(500).json({ error: "Failed to delete membership" });
  }
};

/**
 * @route GET /api/admin/memberships/count
 * @desc Get count of membership applications
 * @access Protected
 */
export const getMembershipApplicationsCount = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const query = `count(*[_type == "membershipApplication"])`;
    const count = await sanityClient.fetch(query);
    res.status(200).json({ count });
  } catch (err) {
    console.error("Failed to count membership applications:", err);
    res.status(500).json({ error: "Failed to count membership applications" });
  }
};
