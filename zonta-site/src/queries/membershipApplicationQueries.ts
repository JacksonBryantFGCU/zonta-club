// zonta-site/src/queries/membershipApplicationQueries.ts

export interface MembershipApplication {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  membershipType?: {
    _id: string;
    title: string;
    price: number;
  };
}

export async function fetchMembershipApplications(): Promise<MembershipApplication[]> {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/membership-applications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch membership applications");
  return res.json();
}

export async function updateMembershipApplicationStatus(
  id: string,
  status: string
): Promise<void> {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Unauthorized");

  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/membership-applications/${id}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!res.ok) throw new Error("Failed to update membership application");
}

export async function deleteMembershipApplication(id: string) {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Not authorized — please log in again.");

  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/membership-applications/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete membership application: ${text}`);
  }

  return res.json();
}