// zonta-server/src/routes/categoriesRoutes.ts

import express from "express";

import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../controllers/categoriesController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getCategories);
router.post("/", protect, createCategory);
router.delete("/:id", protect, deleteCategory);

export default router;
