// zonta-server/src/routes/membershipsRoutes.ts

import express from "express";

import {
  getMemberships,
  getMembershipById,
  createMembership,
  updateMembership,
  deleteMembership,
  getMembershipApplicationsCount,
} from "../controllers/membershipsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMemberships);
router.get("/applications/count", protect, getMembershipApplicationsCount);
router.get("/:id", protect, getMembershipById);
router.post("/", protect, createMembership);
router.put("/:id", protect, updateMembership);
router.delete("/:id", protect, deleteMembership);

export default router;
