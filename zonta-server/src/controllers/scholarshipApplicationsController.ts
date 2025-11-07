// zonta-server/src/controllers/scholarshipApplicationsController.ts

import type { Request, Response } from "express";

import { sanityClient } from "@services/sanityService";

interface ScholarshipApplication {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  essay?: string;
  scholarshipType?: { _ref: string; _type: "reference" };
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
}

/**
 * @route GET /api/admin/scholarship-applications
 * @desc Get all scholarship applications
 * @access Protected
 */
export const getScholarshipApplications = async (_req: Request, res: Response) => {
  try {
    const query = `*[_type == "scholarshipApplication"] | order(createdAt desc){
      _id, name, email, phone, essay, status, createdAt,
      scholarshipType->{_id, title, deadline}
    }`;

    const applications = await sanityClient.fetch(query);
    res.status(200).json(applications);
  } catch (err) {
    console.error(" Failed to fetch scholarship applications:", err);
    res.status(500).json({ error: "Failed to fetch scholarship applications" });
  }
};

/**
 * @route PATCH /api/admin/scholarship-applications/:id/status
 * @desc Update scholarship application status
 * @access Protected
 */
export const updateScholarshipApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: ScholarshipApplication["status"] };

    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid status value" });
      return;
    }

    const updated = await sanityClient.patch(id).set({ status }).commit();
    res.status(200).json({ message: "Status updated", updated });
  } catch (err) {
    console.error(" Failed to update scholarship application:", err);
    res.status(500).json({ error: "Failed to update scholarship application" });
  }
};

/**
 * @route DELETE /api/admin/scholarship-applications/:id
 * @desc Delete scholarship application
 * @access Protected
 */
export const deleteScholarshipApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await sanityClient.delete(id);
    res.status(200).json({ message: "Scholarship application deleted successfully" });
  } catch (err) {
    console.error(" Failed to delete scholarship application:", err);
    res.status(500).json({ error: "Failed to delete scholarship application" });
  }
};
