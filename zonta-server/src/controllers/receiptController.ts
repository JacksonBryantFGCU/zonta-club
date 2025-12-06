// zonta-server/src/controllers/receiptController.ts

import type { Request, Response } from "express";

import { generateReceipt } from "@utils/generateReceipt.js";
import { sanityClient } from "@utils/sanityClient.js";

export const getReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      res.status(400).json({ message: "Missing order ID" });
      return;
    }

    // Fetch order from Sanity
    const query = `*[_type == "order" && _id == $orderId][0]{
      _id,
      customerName,
      email,
      total,
      createdAt,
      "items": items[]{
        productName,
        quantity,
        price
      }
    }`;

    const order = await sanityClient.fetch(query, { orderId });

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // Map fields to match generateReceipt format
    const formattedOrder = {
      _id: order._id,
      customerName: order.customerName || "Valued Customer",
      customerEmail: order.email,
      createdAt: order.createdAt,
      total: order.total,
      items: (order.items || []).map((item: any) => ({
        title: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    const filePath = await generateReceipt(formattedOrder);
    res.setHeader("Content-Type", "application/pdf");
    res.download(filePath, (err) => {
      if (err) console.error("PDF download error:", err);
    });
  } catch (err) {
    console.error("Receipt generation error:", err);
    res.status(500).json({ message: "Error generating receipt" });
  }
};