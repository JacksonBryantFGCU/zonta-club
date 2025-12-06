// zonta-server/src/routes/membershipApplicationsRoutes.ts

import express from "express";

import {
  getMembershipApplications,
  updateMembershipApplicationStatus,
  deleteMembershipApplication,
  createMembershipPaymentLink,
} from "@controllers/membershipApplicationsController.js";
import { protect } from "@middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMembershipApplications);
router.patch("/:id/status", protect, updateMembershipApplicationStatus);
router.post("/:id/payment-link", protect, createMembershipPaymentLink);
router.delete("/:id", protect, deleteMembershipApplication);

export default router;