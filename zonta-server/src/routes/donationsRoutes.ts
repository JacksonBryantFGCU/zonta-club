// zonta-server/src/routes/donationsRoutes.ts

import express from "express";

import {
  getDonations,
  getAllDonations,
  createDonation,
  updateDonation,
  deleteDonation,
} from "@controllers/donationsController";
import { protect } from "@middlewares/authMiddleware";

const router = express.Router();

router.get("/", getDonations); // Public - active donations only
router.get("/all", protect, getAllDonations); // Admin - all donations
router.post("/", protect, createDonation); // Admin - create
router.put("/:id", protect, updateDonation); // Admin - update
router.delete("/:id", protect, deleteDonation); // Admin - delete

export default router;
