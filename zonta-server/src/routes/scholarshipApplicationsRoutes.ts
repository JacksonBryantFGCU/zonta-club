import express from "express";

import {
  getScholarshipApplications,
  updateScholarshipApplicationStatus,
  deleteScholarshipApplication,
} from "@controllers/scholarshipApplicationsController";
import { protect } from "@middlewares/authMiddleware";

const router = express.Router();

router.get("/", protect, getScholarshipApplications);
router.patch("/:id/status", protect, updateScholarshipApplicationStatus);
router.delete("/:id", protect, deleteScholarshipApplication);

export default router;