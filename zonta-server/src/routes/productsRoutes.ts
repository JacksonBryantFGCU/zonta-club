import express from "express";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@controllers/productsController";
import { protect } from "@middlewares/authMiddleware";

const router = express.Router();

router.get("/", protect, getProducts);
router.post("/", protect, createProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;
