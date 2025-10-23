import { Router } from "express";

import { getAllOrders, updateOrderStatus } from "@controllers/orderController";

const router = Router();

/**
 * @route GET /api/orders
 * @desc Get all orders (admin)
 */
router.get("/", getAllOrders);

/**
 * @route POST /api/orders/update-status
 * @desc Update order status (admin)
 */
router.post("/update-status", updateOrderStatus);

export default router;