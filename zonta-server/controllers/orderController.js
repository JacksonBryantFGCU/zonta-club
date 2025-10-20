import { sanityClient } from "../utils/sanityClient.js";

export const getAllOrders = async (req, res) => {
  try {
    const query = `*[_type == "order"] | order(createdAt desc) {
      _id,
      email,
      total,
      status,
      createdAt
    }`;
    const orders = await sanityClient.fetch(query);
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    const result = await sanityClient.patch(id).set({ status }).commit();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to update order" });
  }
};