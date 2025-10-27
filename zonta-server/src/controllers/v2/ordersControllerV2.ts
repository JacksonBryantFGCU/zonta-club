import type { Request, Response } from "express";

import {
  fetchDocuments,
  fetchDocumentById,
  updateDocument,
  deleteDocument,
} from "@services/sanityService";
import type { BaseDocument } from "@utils/types";

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
 * @route GET /api/v2/orders
 * @desc Get all orders (admin)
 * @access Protected
 */
export const getOrdersV2 = async (_req: Request, res: Response): Promise<void> => {
  try {
    console.log("🧠 Fetching orders from Sanity...");
    const orders = await fetchDocuments<Order>("order");
    console.log("✅ Orders fetched:", orders?.length);
    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Failed to fetch orders:", err);
    res.status(500).json({ error: String(err) });
  }
};

/**
 * @route GET /api/v2/orders/:id
 * @desc Get a single order by ID (admin)
 * @access Protected
 */
export const getOrderByIdV2 = async (req: Request, res: Response): Promise<void> => {
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
    console.error("❌ Failed to fetch order by ID:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

/**
 * @route PATCH /api/v2/orders/update-status
 * @desc Update order status (admin)
 * @access Protected
 */
export const updateOrderStatusV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, status } = req.body as { id: string; status: string };

    if (!id || !status) {
      res.status(400).json({ error: "Missing order ID or status" });
      return;
    }

    const updatedOrder = await updateDocument<Order>(id, { status });
    res.status(200).json({
      message: `✅ Order ${id} updated successfully`,
      updatedOrder,
    });
  } catch (err) {
    console.error("❌ Failed to update order:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
};

/**
 * @route DELETE /api/v2/orders/:id
 * @desc Delete an order (admin)
 * @access Protected
 */
export const deleteOrderV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Missing order ID" });
      return;
    }

    await deleteDocument(id);
    res.status(200).json({
      message: `🗑️ Order ${id} deleted successfully`,
    });
  } catch (err) {
    console.error("❌ Failed to delete order:", err);
    res.status(500).json({ error: "Failed to delete order" });
  }
};