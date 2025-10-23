import type { Request, Response } from "express";

import { sanityClient } from "@utils/sanityClient";

export const getAllOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      *[_type == "order"] | order(createdAt desc) {
        _id,
        email,
        total,
        status,
        createdAt
      }
    `;
    const orders = await sanityClient.fetch(query);
    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Failed to fetch orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, status } = req.body as { id: string; status: string };

    if (!id || !status) {
      res.status(400).json({ error: "Missing order ID or status" });
      return;
    }

    const result = await sanityClient.patch(id).set({ status }).commit();
    res.status(200).json(result);
  } catch (err) {
    console.error("❌ Failed to update order:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
};