// zonta-server/src/routes/scholarshipsPublicRoutes.ts

import express from "express";

import {
  getPublicScholarships,
  submitScholarshipApplication,
} from "../controllers/scholarshipsPublicController.js";

const router = express.Router();

/**
 * @desc Public Scholarship Routes
 * Base: /api/scholarships
 */

// 🔹 GET all active scholarships (public)
router.get("/", getPublicScholarships);

// 🔹 POST new scholarship application
router.post("/apply", submitScholarshipApplication);

export default router;
