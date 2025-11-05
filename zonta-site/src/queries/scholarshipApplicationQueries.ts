// ================================
// 🧠 Scholarship Application Types
// ================================
export interface ScholarshipApplication {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  gpa?: number;
  essay?: string;
  references?: string[];
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  scholarship?: {
    _id: string;
    title: string;
  };
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
// 📦 Fetch All Scholarship Applications
// ================================
export const fetchScholarshipApplications = async (): Promise<ScholarshipApplication[]> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/scholarship-applications`,
    { headers: getAuthHeaders() }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to fetch scholarship applications: ${msg}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : data.applications || [];
};

// ================================
// 🟡 Update Application Status
// ================================
export const updateScholarshipApplicationStatus = async (
  id: string,
  status: "pending" | "approved" | "rejected"
): Promise<void> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/scholarship-applications/${id}/status`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to update scholarship application status: ${msg}`);
  }
};

// ================================
// 🗑️ Delete Scholarship Application
// ================================
export const deleteScholarshipApplication = async (id: string): Promise<void> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/scholarship-applications/${id}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to delete scholarship application: ${msg}`);
  }
};