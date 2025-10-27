// server/controllers/v2/scholarshipsControllerV2.ts
import type { Request, Response } from "express";

import {
  fetchDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
} from "@services/sanityService";
import { sanityClient } from "@utils/sanityClient";
import type { BaseDocument } from "@utils/types";

interface Scholarship extends BaseDocument {
  title: string;
  description: string;
  eligibility?: string[];
  deadline?: string;
  applicationFile?: { _type: string; asset: { _ref: string } };
  image?: { _type: string; asset: { _ref: string } };
  order?: number;
}

/**
 * @route GET /api/v2/admin/scholarships
 * @desc Get all scholarships
 * @access Protected
 */
export const getScholarshipsV2 = async (_req: Request, res: Response): Promise<void> => {
  try {
    console.log("🎓 Fetching scholarships from Sanity...");

    const query = `
      *[_type == "scholarship"] | order(order asc) {
        _id,
        title,
        description,
        eligibility,
        deadline,
        "fileUrl": applicationFile.asset->url,
        "imageUrl": image.asset->url,
        order
      }
    `;

    const scholarships = await sanityClient.fetch(query);
    console.log(`✅ Scholarships fetched: ${scholarships.length}`);
    res.status(200).json(scholarships);
  } catch (err) {
    console.error("❌ Failed to fetch scholarships:", err);
    res.status(500).json({ error: "Failed to fetch scholarships" });
  }
};

/**
 * @route GET /api/v2/admin/scholarships/:id
 * @desc Get a single scholarship by ID
 * @access Protected
 */
export const getScholarshipByIdV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const scholarship = await fetchDocumentById<Scholarship>(id);

    if (!scholarship) {
      res.status(404).json({ error: "Scholarship not found" });
      return;
    }

    res.status(200).json(scholarship);
  } catch (err) {
    console.error("❌ Failed to fetch scholarship by ID:", err);
    res.status(500).json({ error: "Failed to fetch scholarship" });
  }
};

/**
 * @route POST /api/v2/admin/scholarships
 * @desc Create a new scholarship
 * @access Protected
 */
export const createScholarshipV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const newScholarship = await createDocument<Scholarship>("scholarship", req.body);
    res.status(201).json({
      message: "✅ Scholarship created successfully",
      scholarship: newScholarship,
    });
  } catch (err) {
    console.error("❌ Failed to create scholarship:", err);
    res.status(500).json({ error: "Failed to create scholarship" });
  }
};

/**
 * @route PUT /api/v2/admin/scholarships/:id
 * @desc Update scholarship
 * @access Protected
 */
export const updateScholarshipV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedScholarship = await updateDocument<Scholarship>(id, req.body);
    res.status(200).json({
      message: "✅ Scholarship updated successfully",
      scholarship: updatedScholarship,
    });
  } catch (err) {
    console.error("❌ Failed to update scholarship:", err);
    res.status(500).json({ error: "Failed to update scholarship" });
  }
};

/**
 * @route DELETE /api/v2/admin/scholarships/:id
 * @desc Delete scholarship
 * @access Protected
 */
export const deleteScholarshipV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteDocument(id);
    res.status(200).json({ message: "🗑️ Scholarship deleted successfully" });
  } catch (err) {
    console.error("❌ Failed to delete scholarship:", err);
    res.status(500).json({ error: "Failed to delete scholarship" });
  }
};