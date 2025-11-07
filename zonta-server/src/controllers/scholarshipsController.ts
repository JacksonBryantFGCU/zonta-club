// zonta-server/src/controllers/scholarshipsController.ts

import type { Request, Response } from "express";

import {
  fetchDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
} from "@services/sanityService";
import { sanityClient } from "@services/sanityService";
import type { BaseDocument } from "@utils/types";

interface Scholarship extends BaseDocument {
  title: string;
  description?: string;
  eligibility?: string[];
  amount?: number;
  deadline?: string;
  applyInstructions?: string;
  contactEmail?: string;
  isActive?: boolean;
  image?: { _type: string; asset: { _ref: string } };
  order?: number;
}

/**
 * @route GET /api/admin/scholarships
 * @desc Get all scholarships (admin)
 * @access Protected
 */
export const getScholarships = async (_req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      *[_type == "scholarship"] | order(order asc) {
        _id,
        title,
        description,
        eligibility,
        amount,
        deadline,
        applyInstructions,
        contactEmail,
        isActive,
        "imageUrl": image.asset->url,
        order
      }
    `;
    const scholarships = await sanityClient.fetch(query);
    res.status(200).json(scholarships);
  } catch (err) {
    console.error(" Failed to fetch scholarships:", err);
    res.status(500).json({ error: "Failed to fetch scholarships" });
  }
};

/**
 * @route GET /api/admin/scholarships/:id
 * @desc Get a single scholarship by ID
 * @access Protected
 */
export const getScholarshipById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const scholarship = await fetchDocumentById<Scholarship>(id);

    if (!scholarship) {
      res.status(404).json({ error: "Scholarship not found" });
      return;
    }

    res.status(200).json(scholarship);
  } catch (err) {
    console.error(" Failed to fetch scholarship by ID:", err);
    res.status(500).json({ error: "Failed to fetch scholarship" });
  }
};

/**
 * @route POST /api/admin/scholarships
 * @desc Create a new scholarship
 * @access Protected
 */
export const createScholarship = async (req: Request, res: Response): Promise<void> => {
  try {
    const newScholarship = await createDocument<Scholarship>("scholarship", req.body);
    res.status(201).json({
      message: " Scholarship created successfully",
      scholarship: newScholarship,
    });
  } catch (err) {
    console.error(" Failed to create scholarship:", err);
    res.status(500).json({ error: "Failed to create scholarship" });
  }
};

/**
 * @route PUT /api/admin/scholarships/:id
 * @desc Update scholarship
 * @access Protected
 */
export const updateScholarship = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await updateDocument<Scholarship>(id, req.body);
    res.status(200).json({
      message: " Scholarship updated successfully",
      scholarship: updated,
    });
  } catch (err) {
    console.error(" Failed to update scholarship:", err);
    res.status(500).json({ error: "Failed to update scholarship" });
  }
};

/**
 * @route DELETE /api/admin/scholarships/:id
 * @desc Delete scholarship
 * @access Protected
 */
export const deleteScholarship = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteDocument(id);
    res.status(200).json({ message: " Scholarship deleted successfully" });
  } catch (err) {
    console.error(" Failed to delete scholarship:", err);
    res.status(500).json({ error: "Failed to delete scholarship" });
  }
};
