import express from "express";

import {
  getMembershipsV2,
  getMembershipByIdV2,
  createMembershipV2,
  updateMembershipV2,
  deleteMembershipV2,
} from "@controllers/v2/membershipsControllerV2";
import { protect } from "@middlewares/authMiddleware";

const router = express.Router();

router.get("/", protect, getMembershipsV2);
router.get("/:id", protect, getMembershipByIdV2);
router.post("/", protect, createMembershipV2);
router.put("/:id", protect, updateMembershipV2);
router.delete("/:id", protect, deleteMembershipV2);

export default router;