import express from "express";

import {
  getScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
} from "@controllers/scholarshipsController";
import { protect } from "@middlewares/authMiddleware";

const router = express.Router();

/**
 * @desc Admin Scholarship Routes
 * Base: /api/admin/scholarships
 */
router.get("/", protect, getScholarships);
router.get("/:id", protect, getScholarshipById);
router.post("/", protect, createScholarship);
router.put("/:id", protect, updateScholarship);
router.delete("/:id", protect, deleteScholarship);

export default router;