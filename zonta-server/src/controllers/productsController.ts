// zonta-server/src/controllers/productsController.ts

import type { Request, Response } from "express";

import {
  fetchDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../services/sanityService.js";
import { sanityClient } from "../utils/sanityClient.js";
import type { BaseDocument } from "../utils/types.js";

interface Product extends BaseDocument {
  title: string;
  price: number;
  description?: string;
  image?: { asset: { _ref: string } };
  inStock?: boolean;
  category?: { _ref: string };
}

/* ============================================================
   PUBLIC: GET /api/products
   ============================================================ */
export const getPublicProducts = async (_req: Request, res: Response) => {
  try {
    const query = `
      *[_type == "product"] | order(_createdAt desc) {
        _id,
        title,
        price,
        description,
        inStock,
        "imageUrl": image.asset->url,
        "category": category->title,
        "categoryId": category->_id
      }
    `;

    const products = await sanityClient.fetch(query);
    res.status(200).json(products);
  } catch (err) {
    console.error("Failed to fetch public products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

/* ============================================================
   ADMIN: GET /api/admin/products
   ============================================================ */
export const getAdminProducts = async (_req: Request, res: Response) => {
  try {
    const query = `
      *[_type == "product"] | order(_createdAt desc) {
        _id,
        title,
        price,
        description,
        inStock,
        "imageUrl": image.asset->url,
        "categoryId": category->_id,
        "categoryTitle": category->title,
        _createdAt,
        _updatedAt
      }
    `;

    const products = await sanityClient.fetch(query);
    res.status(200).json(products);
  } catch (err) {
    console.error("Failed to fetch admin products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

/* ============================================================
   GET /api/admin/products/:id
   ============================================================ */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await fetchDocumentById<Product>(id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.status(200).json(product);
  } catch (err) {
    console.error("Failed to fetch product:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

/* ============================================================
   POST /api/admin/products
   ============================================================ */
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { imageData, category, ...productData } = req.body;

    let imageAsset = null;

    if (imageData) {
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      imageAsset = await sanityClient.assets.upload("image", buffer, {
        filename: `product-${Date.now()}.jpg`,
      });
    }

    const productWithRefs = {
      ...productData,
      ...(imageAsset && {
        image: {
          _type: "image",
          asset: { _type: "reference", _ref: imageAsset._id },
        },
      }),
      ...(category && {
        category: { _type: "reference", _ref: category },
      }),
    };

    const newProduct = await createDocument<Product>("product", productWithRefs);

    res.status(201).json({ message: "Product created", product: newProduct });
  } catch (err) {
    console.error("Failed to create product:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
};

/* ============================================================
   PUT /api/admin/products/:id
   ============================================================ */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { imageData, category, ...productData } = req.body;

    let imageAsset = null;

    if (imageData) {
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      imageAsset = await sanityClient.assets.upload("image", buffer, {
        filename: `product-${Date.now()}.jpg`,
      });
    }

    const productWithRefs = {
      ...productData,
      ...(imageAsset && {
        image: {
          _type: "image",
          asset: { _type: "reference", _ref: imageAsset._id },
        },
      }),
      ...(category !== undefined && {
        category: category ? { _type: "reference", _ref: category } : null,
      }),
    };

    const updatedProduct = await updateDocument<Product>(id, productWithRefs);

    res.status(200).json({ message: "Product updated", product: updatedProduct });
  } catch (err) {
    console.error("Failed to update product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
};

/* ============================================================
   DELETE /api/admin/products/:id
   ============================================================ */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await deleteDocument(id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Failed to delete product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
};
