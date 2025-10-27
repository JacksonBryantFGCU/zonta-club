import express from "express";

import {
  getOrdersV2,
  getOrderByIdV2,
  updateOrderStatusV2,
  deleteOrderV2,
} from "../../controllers/v2/ordersControllerV2.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @route GET /api/v2/admin/orders
 * @desc Get all orders (admin)
 * @access Protected
 */
router.get("/", protect, getOrdersV2);

/**
 * @route GET /api/v2/admin/orders/:id
 * @desc Get single order
 * @access Protected
 */
router.get("/:id", protect, getOrderByIdV2);

/**
 * @route PATCH /api/v2/admin/orders/update-status
 * @desc Update order status
 * @access Protected
 */
router.patch("/update-status", protect, updateOrderStatusV2);

/**
 * @route DELETE /api/v2/admin/orders/:id
 * @desc Delete order
 * @access Protected
 */
router.delete("/:id", protect, deleteOrderV2);

export default router;