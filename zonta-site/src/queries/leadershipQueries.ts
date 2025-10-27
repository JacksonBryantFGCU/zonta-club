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
// 📦 Fetch All Leaders
// ================================
export const fetchLeadership = async (): Promise<Leader[]> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/v2/admin/events`, // ✅ use admin endpoint
    { headers: getAuthHeaders() }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to fetch leadership data: ${msg}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : data.leadership || [];
};