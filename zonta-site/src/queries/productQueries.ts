// ================================
// 📦 Product Queries (Admin v2)
// ================================

export interface Product {
  _id: string;
  title: string;
  price: number;
  description?: string;
  imageUrl?: string;
  inStock: boolean;
  category?: string;
}

// ================================
// 🔐 Helper: Get Admin Token
// ================================
function getAuthHeaders() {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No admin token found. Please log in again.");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// ================================
// 📦 Fetch All Products
// ================================
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/v2/admin/products`,
      { headers: getAuthHeaders() }
    );

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Failed to fetch products: ${msg}`);
    }

    const data = await res.json().catch(() => ({}));

    // ✅ Normalize Sanity data structure
    if (Array.isArray(data)) return data;
    if (data.products && Array.isArray(data.products)) return data.products;
    return [];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ fetchProducts error:", message);
    throw err;
  }
};

// ================================
// ➕ Create Product
// ================================
export const createProduct = async (
  newProduct: Partial<Product>
): Promise<Product> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/v2/admin/products`,
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
};

// ================================
// 🔄 Update Product
// ================================
export const updateProduct = async (
  id: string,
  updates: Partial<Product>
): Promise<Product> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/v2/admin/products/${id}`,
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
};

// ================================
// 🗑️ Delete Product
// ================================
export const deleteProduct = async (
  id: string
): Promise<{ success: boolean }> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/v2/admin/products/${id}`,
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
};