import { Router } from "express";

import { getReceipt } from "@controllers/receiptController";

const router = Router();

/**
 * @route GET /api/receipts/:orderId
 * @desc Download a receipt PDF for the specified order
 */
router.get("/:orderId", getReceipt);

export default router;
