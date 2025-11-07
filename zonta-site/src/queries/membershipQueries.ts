// zonta-site/src/queries/membershipQueries.ts

export interface Membership {
  _id: string;
  title: string;
  price: number;
  description?: string;
  benefits?: string[];
  duration?: number;
  isActive?: boolean;
}

function getAuthHeaders() {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No admin token found.");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export const fetchMemberships = async (): Promise<Membership[]> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/memberships`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error("Failed to fetch memberships");
  return res.json();
};

export const createMembership = async (newMembership: Partial<Membership>): Promise<Membership> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/memberships`,
    { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(newMembership) }
  );
  if (!res.ok) throw new Error("Failed to create membership");
  return res.json();
};

export const updateMembership = async (id: string, updates: Partial<Membership>): Promise<Membership> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/memberships/${id}`,
    { method: "PUT", headers: getAuthHeaders(), body: JSON.stringify(updates) }
  );
  if (!res.ok) throw new Error("Failed to update membership");
  return res.json();
};

export const deleteMembership = async (id: string): Promise<void> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/memberships/${id}`,
    { method: "DELETE", headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error("Failed to delete membership");
};