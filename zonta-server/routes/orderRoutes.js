import express from "express";
import { getAllOrders, updateOrderStatus } from "../controllers/orderController.js";

const router = express.Router();

router.get("/", getAllOrders);
router.post("/update-status", updateOrderStatus);

export default router;