// zonta-server/src/controllers/scholarshipsPublicController.ts

import type { Request, Response } from "express";

import { sanityClient } from "../services/sanityService.js";

//  Add `_type` to the interface to match Sanity's document schema
interface ScholarshipApplication {
  _id?: string;
  _type: "scholarshipApplication"; // 👈 Added this line
  name: string;
  email: string;
  phone?: string;
  gpa?: number;
  essay?: string;
  references?: string[];
  scholarship?: { _ref: string; _type: "reference" };
  status?: "pending" | "approved" | "rejected";
  createdAt?: string;
}

/**
 * @route GET /api/scholarships
 * @desc Fetch active scholarships for public site
 * @access Public
 */
export const getPublicScholarships = async (_req: Request, res: Response) => {
  try {
    const query = `
      *[_type == "scholarship"] | order(order asc) {
        _id,
        title,
        description,
        eligibility,
        deadline,
        "imageUrl": image.asset->url,
        order
      }
    `;
    const scholarships = await sanityClient.fetch(query);
    res.status(200).json(scholarships);
  } catch (err) {
    console.error("Failed to fetch scholarships:", err);
    res.status(500).json({ error: "Failed to fetch scholarships" });
  }
};

/**
 * @route POST /api/scholarships/apply
 * @desc Submit a new scholarship application
 * @access Public
 */
export const submitScholarshipApplication = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, gpa, essay, references, scholarshipId } = req.body;

    // Basic validation
    if (!name || !email || !scholarshipId) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Prevent duplicate applications from same email for same scholarship
    const duplicateQuery = `*[_type == "scholarshipApplication" && email == $email && scholarship._ref == $scholarshipId][0]`;
    const existing = await sanityClient.fetch(duplicateQuery, {
      email,
      scholarshipId,
    });

    if (existing) {
      res.status(400).json({ error: "You have already applied for this scholarship." });
      return;
    }

    //  Build Sanity document
    const doc: ScholarshipApplication = {
      _type: "scholarshipApplication",
      name,
      email,
      phone,
      gpa,
      essay,
      references,
      scholarship: { _type: "reference", _ref: scholarshipId },
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const created = await sanityClient.create(doc);

    res.status(201).json({
      message: " Scholarship application submitted successfully.",
      application: created,
    });
  } catch (err) {
    console.error(" Failed to submit scholarship application:", err);
    res.status(500).json({ error: "Failed to submit scholarship application" });
  }
};
