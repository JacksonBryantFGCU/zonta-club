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
 * @route GET /api/v2/admin/memberships
 * @desc Get all memberships
 * @access Protected
 */
export const getMembershipsV2 = async (_req: Request, res: Response): Promise<void> => {
  try {
    const query = `*[_type == "membership"] | order(order asc){
      _id, title, price, description, benefits, duration, isActive, order
    }`;
    const memberships = await sanityClient.fetch(query);
    res.status(200).json(memberships);
  } catch (err) {
    console.error("❌ Failed to fetch memberships:", err);
    res.status(500).json({ error: "Failed to fetch memberships" });
  }
};

export const getMembershipByIdV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const membership = await fetchDocumentById<Membership>(id);
    if (!membership) {
      res.status(404).json({ error: "Membership not found" });
      return;
    }
    res.status(200).json(membership);
  } catch (err) {
    console.error("❌ Failed to fetch membership:", err);
    res.status(500).json({ error: "Failed to fetch membership" });
  }
};

export const createMembershipV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const newMembership = await createDocument<Membership>("membership", req.body);
    res.status(201).json({
      message: "✅ Membership created successfully",
      membership: newMembership,
    });
  } catch (err) {
    console.error("❌ Failed to create membership:", err);
    res.status(500).json({ error: "Failed to create membership" });
  }
};

export const updateMembershipV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await updateDocument<Membership>(id, req.body);
    res.status(200).json({ message: "✅ Membership updated", membership: updated });
  } catch (err) {
    console.error("❌ Failed to update membership:", err);
    res.status(500).json({ error: "Failed to update membership" });
  }
};

export const deleteMembershipV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteDocument(id);
    res.status(200).json({ message: "🗑️ Membership deleted successfully" });
  } catch (err) {
    console.error("❌ Failed to delete membership:", err);
    res.status(500).json({ error: "Failed to delete membership" });
  }
};