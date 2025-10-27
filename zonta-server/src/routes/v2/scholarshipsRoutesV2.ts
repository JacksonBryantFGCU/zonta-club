import express from "express";

import {
  getScholarshipsV2,
  createScholarshipV2,
  updateScholarshipV2,
  deleteScholarshipV2,
} from "@controllers/v2/scholarshipsControllerV2";
import { protect } from "@middlewares/authMiddleware";

const router = express.Router();

router.get("/", protect, getScholarshipsV2);
router.post("/", protect, createScholarshipV2);
router.put("/:id", protect, updateScholarshipV2);
router.delete("/:id", protect, deleteScholarshipV2);

export default router;