// zonta-server/src/routes/leadershipRoutes.ts

import express from "express";

import {
  getLeadership,
  createLeadership,
  updateLeadership,
  deleteLeadership,
} from "@controllers/leadershipController";
import { protect } from "@middlewares/authMiddleware";

const router = express.Router();

router.get("/", getLeadership);
router.post("/", protect, createLeadership);
router.put("/:id", protect, updateLeadership);
router.delete("/:id", protect, deleteLeadership);

export default router;
