// zonta-server/src/routes/leadershipRoutes.ts

import express from "express";

import {
  getLeadership,
  createLeadership,
  updateLeadership,
  deleteLeadership,
} from "@controllers/leadershipController.js";
import { protect } from "@middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getLeadership);
router.post("/", protect, createLeadership);
router.put("/:id", protect, updateLeadership);
router.delete("/:id", protect, deleteLeadership);

export default router;
