// zonta-server/src/routes/membershipApplicationsRoutes.ts

import express from "express";

import {
  getMembershipApplications,
  updateMembershipApplicationStatus,
  deleteMembershipApplication,
} from "../controllers/membershipApplicationsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMembershipApplications);
router.patch("/:id/status", protect, updateMembershipApplicationStatus);
router.delete("/:id", protect, deleteMembershipApplication);

export default router;
