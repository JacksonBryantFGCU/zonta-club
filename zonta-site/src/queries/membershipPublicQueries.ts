export interface Membership {
  _id: string;
  title: string;
  price: number;
  description?: string;
  benefits?: string[];
  duration?: number;
}

export const fetchPublicMemberships = async (): Promise<Membership[]> => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/memberships`);
  if (!res.ok) throw new Error("Failed to fetch memberships");
  return res.json();
};

export const submitMembershipApplication = async (data: {
  name: string;
  email: string;
  message?: string;
  membershipId: string;
}) => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/memberships/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit membership application");
  return res.json();
};