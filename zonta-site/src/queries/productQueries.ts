// zonta-site/src/queries/productQueries.ts

// ==============================================
// 📦 Product Queries (Admin)
// ==============================================

export interface Product {
  _id: string;
  title: string;
  price: number;
  description?: string;
  imageUrl?: string;
  inStock: boolean;
  category?: string; // Category title (resolved from Sanity)
  categoryId?: string; // Underlying Sanity ref ID
  createdAt?: string;
  updatedAt?: string;
}

// ==============================================
// 🔐 Helper: Auth Headers
// ==============================================
function getAuthHeaders() {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No admin token found. Please log in again.");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// ==============================================
// 🧠 Fetch All Products
// ==============================================
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/admin/products`,
      { headers: getAuthHeaders() }
    );

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Failed to fetch products: ${msg}`);
    }

    const data = await res.json();
    console.log("  Raw product data:", data);

    //  Normalize: handle array or wrapped response
    const products = Array.isArray(data)
      ? data
      : Array.isArray(data.products)
      ? data.products
      : [];

    //  Clean up / normalize each product
    return products.map((p: unknown) => {
      const prod = p as {
        _id: string;
        title?: string;
        price?: number | string;
        description?: string;
        imageUrl?: string;
        image?: { asset?: { _ref?: string } };
        inStock?: boolean;
        category?: string | { title?: string; _ref?: string; _id?: string };
        categoryId?: string;
        _createdAt?: string;
        _updatedAt?: string;
      };
      return {
        _id: prod._id,
        title: prod.title ?? "Untitled",
        price:
          typeof prod.price === "number"
            ? prod.price
            : parseFloat(prod.price ?? "0") || 0,
        description: prod.description ?? "",
        imageUrl:
          typeof prod.imageUrl === "string"
            ? prod.imageUrl
            : prod.image?.asset?._ref ?? "",
        inStock:
          typeof prod.inStock === "boolean"
            ? prod.inStock
            : Boolean(prod.inStock ?? true),
        //  Category: support dereferenced or ref object
        category:
          typeof prod.category === "string"
            ? prod.category
            : prod.category?.title ??
              (prod.category?._ref
                ? `Ref: ${prod.category._ref.slice(0, 6)}…`
                : "—"),
        categoryId:
          typeof prod.category === "object"
            ? prod.category?._id ?? prod.category?._ref
            : "",
        createdAt: prod._createdAt ?? "",
        updatedAt: prod._updatedAt ?? "",
      };
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(" fetchProducts error:", message);
    throw new Error(message);
  }
};

// ==============================================
// ➕ Create Product
// ==============================================
export const createProduct = async (
  newProduct: Partial<Product>
): Promise<Product> => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/admin/products`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newProduct),
      }
    );

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Failed to create product: ${msg}`);
    }

    const data = await res.json();
    return data.product ?? data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(" createProduct error:", message);
    throw new Error(message);
  }
};

// ==============================================
// ✏️ Update Product
// ==============================================
export const updateProduct = async (
  id: string,
  updates: Partial<Product>
): Promise<Product> => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/admin/products/${id}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      }
    );

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Failed to update product: ${msg}`);
    }

    const data = await res.json();
    return data.product ?? data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(" updateProduct error:", message);
    throw new Error(message);
  }
};

// ==============================================
// 🗑️ Delete Product
// ==============================================
export const deleteProduct = async (
  id: string
): Promise<{ success: boolean }> => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/admin/products/${id}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Failed to delete product: ${msg}`);
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(" deleteProduct error:", message);
    throw new Error(message);
  }
};
