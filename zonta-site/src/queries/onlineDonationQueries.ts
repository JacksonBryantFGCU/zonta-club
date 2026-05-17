// zonta-site/src/queries/onlineDonationQueries.ts
// Admin-only queries for Square online donation records.
// These hit the backend API, not Sanity directly.

export interface OnlineDonation {
  _id: string;
  // one-time fields
  squarePaymentId?: string | null;
  squareStatus?: string | null;
  receiptUrl?: string | null;
  // recurring subscription fields
  squareSubscriptionId?: string | null;
  squareCustomerId?: string | null;
  subscriptionStatus?: string | null;
  cadence?: string | null;
  authorizationAccepted?: boolean | null;
  startedAt?: string | null;
  // shared
  amountCents: number;
  currency: string;
  giftType: string;
  givingLevel: string;
  donorFirstName: string;
  donorLastName: string;
  donorEmail: string;
  donorPhone?: string | null;
  donorStreetAddress?: string | null;
  donorCity?: string | null;
  donorState?: string | null;
  donorZip?: string | null;
  tributeEnabled: boolean;
  tributeType?: string | null;
  honoreeName?: string | null;
  notificationName?: string | null;
  notificationEmail?: string | null;
  notificationAddress?: string | null;
  tributeMessage?: string | null;
  paymentProcessor: string;
  environment: string;
  createdAt: string;
}

interface FetchOptions {
  limit?: number;
  status?: string;
  givingLevel?: string;
  environment?: string;
  giftType?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export async function fetchOnlineDonations(
  options: FetchOptions = {}
): Promise<OnlineDonation[]> {
  const base = (import.meta.env.VITE_BACKEND_URL ?? "").replace(/\/$/, "");
  const params = new URLSearchParams();
  if (options.limit) params.set("limit", String(options.limit));
  if (options.status) params.set("status", options.status);
  if (options.givingLevel) params.set("givingLevel", options.givingLevel);
  if (options.environment) params.set("environment", options.environment);
  if (options.giftType) params.set("giftType", options.giftType);

  const qs = params.toString();
  const url = `${base}/api/admin/online-donations${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(json.error ?? `Failed to fetch donations (${res.status})`);
  }
  const json = (await res.json()) as { donations: OnlineDonation[]; count: number };
  return json.donations;
}
