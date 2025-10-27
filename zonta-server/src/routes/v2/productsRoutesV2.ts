import express from "express";

import {
  getProductsV2,
  createProductV2,
  updateProductV2,
  deleteProductV2,
} from "@controllers/v2/productsControllerV2";
import { protect } from "@middlewares/authMiddleware";

const router = express.Router();

router.get("/", protect, getProductsV2);
router.post("/", protect, createProductV2);
router.put("/:id", protect, updateProductV2);
router.delete("/:id", protect, deleteProductV2);

export default router;