// ================================
// 🧠 Scholarship Types
// ================================
export interface Scholarship {
  _id: string;
  title: string;
  description?: string;
  eligibility?: string[];
  amount?: number;
  deadline?: string;
  applyInstructions?: string;
  contactEmail?: string;
  isActive?: boolean;
  imageUrl?: string;
  order?: number;
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
// 📦 Fetch All Scholarships
// ================================
export const fetchScholarships = async (): Promise<Scholarship[]> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/scholarships`,
    { headers: getAuthHeaders() }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to fetch scholarships: ${msg}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : data.scholarships || [];
};

// ================================
// ➕ Create Scholarship
// ================================
export const createScholarship = async (
  newScholarship: Partial<Scholarship>
): Promise<Scholarship> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/scholarships`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(newScholarship),
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to create scholarship: ${msg}`);
  }

  return res.json();
};

// ================================
// 🔄 Update Scholarship
// ================================
export const updateScholarship = async (
  id: string,
  updates: Partial<Scholarship>
): Promise<Scholarship> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/scholarships/${id}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to update scholarship: ${msg}`);
  }

  return res.json();
};

// ================================
// 🗑️ Delete Scholarship
// ================================
export const deleteScholarship = async (id: string): Promise<void> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/scholarships/${id}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to delete scholarship: ${msg}`);
  }
};