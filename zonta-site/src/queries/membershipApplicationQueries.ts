// zonta-site/src/queries/membershipApplicationQueries.ts

export interface MembershipApplication {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  paid?: boolean;
  paidAt?: string | null;
  stripeSessionId?: string | null;
  paymentIntentId?: string | null;
  membershipType?: {
    _id: string;
    title: string;
    price: number;
  };
}

function getAuthHeaders() {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Unauthorized");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function fetchMembershipApplications(): Promise<MembershipApplication[]> {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/membership-applications`,
    {
      headers: {
        Authorization: getAuthHeaders().Authorization,
      },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch membership applications");
  return res.json();
}

export async function updateMembershipApplicationStatus(
  id: string,
  status: string
): Promise<void> {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/membership-applications/${id}/status`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    }
  );

  if (!res.ok) throw new Error("Failed to update membership application");
}

export async function deleteMembershipApplication(id: string) {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/membership-applications/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: getAuthHeaders().Authorization,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete membership application: ${text}`);
  }

  return res.json();
}

export async function createMembershipPaymentLink(
  id: string
): Promise<{ checkoutUrl: string }> {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/membership-applications/${id}/payment-link`,
    {
      method: "POST",
      headers: {
        Authorization: getAuthHeaders().Authorization,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create payment link: ${text}`);
  }

  return res.json();
}