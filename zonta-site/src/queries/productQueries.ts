// src/queries/productQueries.ts
import groq from "groq";
import { sanity } from "../lib/sanityClient";
import { queryKeys } from "../lib/queryKeys";

export interface Product {
  _id: string;
  title: string;
  price: number;
  description?: string;
  imageUrl?: string;
  inStock: boolean;
  category?: string;
}

export const productQuery = groq`*[_type == "product"]{
  _id,
  title,
  price,
  description,
  inStock,
  "imageUrl": image.asset->url,
  "category": category->title
} | order(title asc)`;

// ✅ Fetch function (used by React Query)
export const fetchProducts = async (): Promise<Product[]> => {
  return await sanity.fetch(productQuery);
};

// ✅ Export reusable key for React Query
export const productKeys = {
  all: queryKeys.products,
};