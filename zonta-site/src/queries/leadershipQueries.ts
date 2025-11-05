// src/queries/leadershipQueries.ts
export interface Leader {
  _id: string;
  name: string;
  role: string;
  bio?: string;
  imageUrl?: string;
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
// 📦 Fetch All Leadership Members
// ================================
export const fetchLeadership = async (): Promise<Leader[]> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/leadership`
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to fetch leadership data: ${msg}`);
  }

  const data: unknown = await res.json();

  // ✅ Ensure runtime shape safety (optional)
  if (!Array.isArray(data)) {
    console.warn("Leadership response not array:", data);
    return [];
  }

  return data as Leader[];
};

// ================================
// ➕ Create Leadership Member
// ================================
export const createLeader = async (
  newLeader: Partial<Leader> & { imageData?: string }
): Promise<Leader> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/leadership`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(newLeader),
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to create leadership member: ${msg}`);
  }

  return res.json();
};

// ================================
// 🔄 Update Leadership Member
// ================================
export const updateLeader = async (
  id: string,
  updates: Partial<Leader> & { imageData?: string }
): Promise<Leader> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/leadership/${id}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to update leadership member: ${msg}`);
  }

  return res.json();
};

// ================================
// 🗑️ Delete Leadership Member
// ================================
export const deleteLeader = async (id: string): Promise<void> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/leadership/${id}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to delete leadership member: ${msg}`);
  }
};