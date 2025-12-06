// zonta-server/src/routes/ordersRoutes.ts

import express from "express";

import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "@controllers/ordersController.js";
import { protect } from "@middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @route GET /api/admin/orders
 * @desc Get all orders (admin)
 * @access Protected
 */
router.get("/", protect, getOrders);

/**
 * @route GET /api/admin/orders/:id
 * @desc Get single order
 * @access Protected
 */
router.get("/:id", protect, getOrderById);

/**
 * @route PATCH /api/admin/orders/update-status
 * @desc Update order status
 * @access Protected
 */
router.patch("/update-status", protect, updateOrderStatus);

/**
 * @route DELETE /api/admin/orders/:id
 * @desc Delete order
 * @access Protected
 */
router.delete("/:id", protect, deleteOrder);

export default router;
