export interface Donation {
  _id: string;
  _type: "donation";
  title: string;
  description: string;
  presetAmounts: number[];
  allowCustomAmount: boolean;
  minAmount: number;
  imageUrl?: string;
  active: boolean;
  order: number;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    console.warn("No authentication token found in localStorage");
  }
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ================================
// 🔍 Public: Fetch Active Donations
// ================================
export const fetchDonations = async (): Promise<Donation[]> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/donations`
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to fetch donations: ${msg}`);
  }

  const data: unknown = await res.json();

  if (!Array.isArray(data)) {
    console.warn("Donations response not array:", data);
    return [];
  }

  return data as Donation[];
};

// ================================
// 🔍 Admin: Fetch All Donations
// ================================
export const fetchDonationsAdmin = async (): Promise<Donation[]> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/donations/all`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to fetch donations: ${msg}`);
  }

  const data: unknown = await res.json();

  if (!Array.isArray(data)) {
    console.warn("Donations response not array:", data);
    return [];
  }

  return data as Donation[];
};

// ================================
// ➕ Create Donation
// ================================
export const createDonation = async (
  newDonation: Partial<Donation> & { imageData?: string }
): Promise<Donation> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/donations`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(newDonation),
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to create donation: ${msg}`);
  }

  return res.json();
};

// ================================
// ✏️ Update Donation
// ================================
export const updateDonation = async (
  id: string,
  updates: Partial<Donation> & { imageData?: string }
): Promise<Donation> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/donations/${id}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to update donation: ${msg}`);
  }

  return res.json();
};

// ================================
// ❌ Delete Donation
// ================================
export const deleteDonation = async (id: string): Promise<void> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/donations/${id}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to delete donation: ${msg}`);
  }
};
