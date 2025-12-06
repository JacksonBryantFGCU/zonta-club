// zonta-server/src/controllers/ordersController.ts

import type { Request, Response } from "express";

import {
  fetchDocuments,
  fetchDocumentById,
  updateDocument,
  deleteDocument,
} from "@services/sanityService.js";
import type { BaseDocument } from "@utils/types.js";

interface Order extends BaseDocument {
  email: string;
  total: number;
  status: string;
  createdAt: string;
  lineItems?: {
    title: string;
    quantity: number;
    price: number;
  }[];
}

/**
 * @route GET /api/orders
 * @desc Get all orders (admin)
 * @access Protected
 */
export const getOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    console.log("Fetching orders from Sanity...");
    const orders = await fetchDocuments<Order>("order");
    console.log("Orders fetched:", orders?.length);
    res.status(200).json(orders);
  } catch (err) {
    console.error("Failed to fetch orders:", err);
    res.status(500).json({ error: String(err) });
  }
};

/**
 * @route GET /api/orders/:id
 * @desc Get a single order by ID (admin)
 * @access Protected
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Missing order ID" });
      return;
    }

    const order = await fetchDocumentById<Order>(id);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.status(200).json(order);
  } catch (err) {
    console.error("Failed to fetch order by ID:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

/**
 * @route PATCH /api/orders/update-status
 * @desc Update order status (admin)
 * @access Protected
 */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, status } = req.body as { id: string; status: string };

    if (!id || !status) {
      res.status(400).json({ error: "Missing order ID or status" });
      return;
    }

    const updatedOrder = await updateDocument<Order>(id, { status });
    res.status(200).json({
      message: `Order ${id} updated successfully`,
      updatedOrder,
    });
  } catch (err) {
    console.error("Failed to update order:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
};

/**
 * @route DELETE /api/orders/:id
 * @desc Delete an order (admin)
 * @access Protected
 */
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Missing order ID" });
      return;
    }

    await deleteDocument(id);
    res.status(200).json({
      message: `Order ${id} deleted successfully`,
    });
  } catch (err) {
    console.error("Failed to delete order:", err);
    res.status(500).json({ error: "Failed to delete order" });
  }
};