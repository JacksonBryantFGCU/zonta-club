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
 * @route GET /api/admin/products
 * @desc Get all products (dereferenced for category titles)
 * @access Protected
 */
export const getProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    console.log("Fetching products from Sanity...");
    const query = `
      *[_type == "product"] | order(_createdAt desc) {
        _id,
        title,
        price,
        description,
        inStock,
        "categoryId": category._ref,
        "categoryTitle": category->title,
        "imageUrl": image.asset->url
      }
    `;
    const products = await sanityClient.fetch(query);

    console.log(`Products fetched: ${products.length}`);
    console.log("Sample product data:", JSON.stringify(products[0], null, 2));
    res.status(200).json(products);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

/**
 * @route GET /api/admin/products/:id
 * @desc Get a single product by ID
 * @access Protected
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await fetchDocumentById<Product>(id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.status(200).json(product);
  } catch (err) {
    console.error("Failed to fetch product by ID:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

/**
 * @route POST /api/admin/products
 * @desc Create a new product (with optional image URL or base64)
 * @access Protected
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageData, category, ...productData } = req.body;

    let imageAsset = null;

    // If imageData is provided (base64 or file), upload to Sanity
    if (imageData) {
      try {
        // Handle base64 image data
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Upload to Sanity assets
        imageAsset = await sanityClient.assets.upload("image", buffer, {
          filename: `product-${Date.now()}.jpg`,
        });

        console.log("Image uploaded to Sanity:", imageAsset._id);
      } catch (imageError) {
        console.error("Image upload failed:", imageError);
        // Continue without image if upload fails
      }
    }

    // Prepare product data with image reference and category reference
    const productWithReferences = {
      ...productData,
      ...(imageAsset && {
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: imageAsset._id,
          },
        },
      }),
      ...(category && {
        category: {
          _type: "reference",
          _ref: category,
        },
      }),
    };

    const newProduct = await createDocument<Product>("product", productWithReferences);
    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (err) {
    console.error("Failed to create product:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
};

/**
 * @route PUT /api/admin/products/:id
 * @desc Update a product (with optional image update)
 * @access Protected
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { imageData, category, ...productData } = req.body;

    let imageAsset = null;

    // If imageData is provided, upload new image to Sanity
    if (imageData) {
      try {
        // Handle base64 image data
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Upload to Sanity assets
        imageAsset = await sanityClient.assets.upload("image", buffer, {
          filename: `product-${Date.now()}.jpg`,
        });

        console.log("Image uploaded to Sanity:", imageAsset._id);
      } catch (imageError) {
        console.error("Image upload failed:", imageError);
        // Continue with update even if image upload fails
      }
    }

    // Prepare product data with optional new image reference and category reference
    const productWithReferences = {
      ...productData,
      ...(imageAsset && {
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: imageAsset._id,
          },
        },
      }),
      ...(category !== undefined && {
        category: category
          ? {
              _type: "reference",
              _ref: category,
            }
          : null,
      }),
    };

    const updatedProduct = await updateDocument<Product>(id, productWithReferences);
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    console.error("Failed to update product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
};

/**
 * @route DELETE /api/admin/products/:id
 * @desc Delete a product
 * @access Protected
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteDocument(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Failed to delete product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
};
