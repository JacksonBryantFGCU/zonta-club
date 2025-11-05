// Category Queries for Admin

export interface Category {
  _id: string;
  title: string;
  slug?: {
    current: string;
  };
}

const API_BASE = import.meta.env.VITE_BACKEND_URL;

/**
 * Get auth headers from localStorage
 */
function getAuthHeaders() {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    console.warn("⚠️ No admin token found in localStorage");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token ?? ""}`,
  };
}

/**
 * Fetch all categories
 */
export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/api/admin/categories`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Create a new category
 */
export async function createCategory(title: string): Promise<Category> {
  const res = await fetch(`${API_BASE}/api/admin/categories`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to create category: ${res.statusText}`
    );
  }

  const data = await res.json();
  return data.category;
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to delete category: ${res.statusText}`
    );
  }
}
