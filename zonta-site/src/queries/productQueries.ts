// zonta-site/src/queries/productQueries.ts

export interface Product {
  _id: string;
  title: string;
  price: number;
  description?: string;
  imageUrl?: string;
  inStock: boolean;
  category: string;
  categoryId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* ================================
   Raw Product Type (from Sanity)
================================ */
interface RawProduct {
  _id: string;
  title?: string;
  price?: number | string;
  description?: string;

  // Admin returns imageUrl
  imageUrl?: string;

  // Public sometimes returns reference
  image?: {
    asset?: {
      _ref?: string;
      url?: string;
    };
  };

  inStock?: boolean;

  // Public can be string or object
  category?: string | { title?: string };

  // Admin provides these:
  categoryId?: string;
  categoryTitle?: string;

  _createdAt?: string;
  _updatedAt?: string;
}

/* ================================
   AUTH HEADERS (ADMIN ONLY)
================================ */
function getAuthHeaders() {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Not authorized — please log in again.");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/* ================================
   Normalize Raw Product → Product
================================ */
function normalizeProduct(p: RawProduct): Product {
  return {
    _id: p._id,
    title: p.title ?? "Untitled",
    price:
      typeof p.price === "number"
        ? p.price
        : Number(p.price ?? 0),

    description: p.description ?? "",

    // Prefer direct URL → fallback to asset
    imageUrl:
      p.imageUrl ??
      p.image?.asset?.url ??
      "",

    inStock: p.inStock ?? true,

    category: p.categoryTitle ?? (typeof p.category === "string" ? p.category : p.category?.title) ?? "Uncategorized",

    categoryId: p.categoryId ?? "",

    createdAt: p._createdAt ?? "",
    updatedAt: p._updatedAt ?? "",
  };
}

/* ================================
   FETCH PRODUCTS (Public or Admin)
================================ */
export const fetchProducts = async (
  isPublic: boolean = false
): Promise<Product[]> => {
  const url = isPublic
    ? `${import.meta.env.VITE_BACKEND_URL}/api/products`
    : `${import.meta.env.VITE_BACKEND_URL}/api/admin/products`;

  const options = isPublic ? {} : { headers: getAuthHeaders() };

  const res = await fetch(url, options);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch products: ${text}`);
  }

  const json = await res.json();

  // Admin returns array directly — public *may* return nested
  const list: RawProduct[] = Array.isArray(json)
    ? json
    : Array.isArray(json.products)
    ? json.products
    : [];

  return list.map(normalizeProduct);
};

/* ================================
   ADMIN: CREATE PRODUCT
================================ */
export const createProduct = async (
  newProduct: Partial<Product>
): Promise<Product> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/products`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(newProduct),
    }
  );

  if (!res.ok) throw new Error(await res.text());

  const { product } = await res.json();

  return normalizeProduct(product);
};

/* ================================
   ADMIN: UPDATE PRODUCT
================================ */
export const updateProduct = async (
  id: string,
  updates: Partial<Product>
): Promise<Product> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/products/${id}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    }
  );

  if (!res.ok) throw new Error(await res.text());

  const { product } = await res.json();
  return normalizeProduct(product);
};

/* ================================
   ADMIN: DELETE PRODUCT
================================ */
export const deleteProduct = async (id: string) => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/products/${id}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) throw new Error(await res.text());
};