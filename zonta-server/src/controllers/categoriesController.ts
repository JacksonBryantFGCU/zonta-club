// zonta-server/src/controllers/categoriesController.ts

import type { Request, Response } from "express";

import { createDocument, deleteDocument } from "@services/sanityService";
import { sanityClient } from "@utils/sanityClient";
import type { BaseDocument } from "@utils/types";

interface Category extends BaseDocument {
  title: string;
  slug?: {
    current: string;
  };
}

/**
 * @route GET /api/admin/categories
 * @desc Get all categories
 * @access Protected
 */
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const query = `*[_type == "category"] | order(title asc) {
      _id,
      title,
      slug
    }`;
    const categories = await sanityClient.fetch(query);
    res.status(200).json(categories);
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

/**
 * @route POST /api/admin/categories
 * @desc Create a new category
 * @access Protected
 */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title } = req.body;

    if (!title) {
      res.status(400).json({ error: "Category title is required" });
      return;
    }

    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    const categoryData = {
      title,
      slug: {
        _type: "slug",
        current: slug,
      },
    };

    const newCategory = await createDocument<Category>("category", categoryData);
    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (err) {
    console.error("Failed to create category:", err);
    res.status(500).json({ error: "Failed to create category" });
  }
};

/**
 * @route DELETE /api/admin/categories/:id
 * @desc Delete a category
 * @access Protected
 */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if category is used by any products
    const checkQuery = `count(*[_type == "product" && references("${id}")])`;
    const productCount = await sanityClient.fetch(checkQuery);

    if (productCount > 0) {
      res.status(400).json({
        error: `Cannot delete category. It is used by ${productCount} product(s).`,
      });
      return;
    }

    await deleteDocument(id);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Failed to delete category:", err);
    res.status(500).json({ error: "Failed to delete category" });
  }
};
