import express from "express";

import {
  getPublicProducts,
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@controllers/productsController.js";
import { protect } from "@middlewares/authMiddleware.js";

const router = express.Router();

/* ============================================
   PUBLIC ROUTES  (/api/products)
============================================ */
router.get("/", getPublicProducts);

/* ============================================
   ADMIN ROUTES  (/api/admin/products)
  
   IMPORTANT:
   These routes must be mounted at:
   app.use("/api/admin/products", router)
============================================ */

// GET /api/admin/products
router.get("/", protect, getAdminProducts);

// GET /api/admin/products/:id
router.get("/:id", protect, getProductById);

// POST /api/admin/products
router.post("/", protect, createProduct);

// PUT /api/admin/products/:id
router.put("/:id", protect, updateProduct);

// DELETE /api/admin/products/:id
router.delete("/:id", protect, deleteProduct);

export default router;