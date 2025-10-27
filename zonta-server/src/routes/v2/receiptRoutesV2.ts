import { Router } from "express";

import { getReceipt } from "@controllers/v2/receiptController";

const router = Router();

/**
 * @route GET /api/receipts/:orderId
 * @desc Download a receipt PDF for the specified order
 */
router.get("/:orderId", getReceipt);

export default router;