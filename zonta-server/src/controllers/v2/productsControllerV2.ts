import type { Request, Response } from "express";

import {
  fetchDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
} from "@services/sanityService";
import { sanityClient } from "@utils/sanityClient";
import type { BaseDocument } from "@utils/types";

interface Product extends BaseDocument {
  title: string;
  price: number;
  description?: string;
  imageUrl?: string;
  inStock?: boolean;
  category?: string;
}

/**
 * @route GET /api/v2/admin/products
 * @desc Get all products (dereferenced for category titles)
 * @access Protected
 */
export const getProductsV2 = async (_req: Request, res: Response): Promise<void> => {
  try {
    console.log("🧠 Fetching products from Sanity...");
    const query = `
      *[_type == "product"] | order(_createdAt desc) {
        _id,
        title,
        price,
        description,
        inStock,
        "category": category->title,
        "imageUrl": image.asset->url
      }
    `;
    const products = await sanityClient.fetch(query);

    console.log(`✅ Products fetched: ${products.length}`);
    res.status(200).json(products);
  } catch (err) {
    console.error("❌ Failed to fetch products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

/**
 * @route GET /api/v2/admin/products/:id
 * @desc Get a single product by ID
 * @access Protected
 */
export const getProductByIdV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await fetchDocumentById<Product>(id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.status(200).json(product);
  } catch (err) {
    console.error("❌ Failed to fetch product by ID:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

/**
 * @route POST /api/v2/admin/products
 * @desc Create a new product
 * @access Protected
 */
export const createProductV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const newProduct = await createDocument<Product>("product", req.body);
    res.status(201).json({
      message: "✅ Product created successfully",
      product: newProduct,
    });
  } catch (err) {
    console.error("❌ Failed to create product:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
};

/**
 * @route PUT /api/v2/admin/products/:id
 * @desc Update a product
 * @access Protected
 */
export const updateProductV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedProduct = await updateDocument<Product>(id, req.body);
    res.status(200).json({
      message: "✅ Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    console.error("❌ Failed to update product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
};

/**
 * @route DELETE /api/v2/admin/products/:id
 * @desc Delete a product
 * @access Protected
 */
export const deleteProductV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteDocument(id);
    res.status(200).json({ message: "🗑️ Product deleted successfully" });
  } catch (err) {
    console.error("❌ Failed to delete product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
};