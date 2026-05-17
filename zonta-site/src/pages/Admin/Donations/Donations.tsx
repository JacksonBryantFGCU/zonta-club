// zonta-site/src/pages/Admin/Donations/Donations.tsx
// Admin view for Square online donation records.
// Donation presets are no longer managed here — the public donation page
// now uses fixed giving levels (bronze/silver/gold/platinum/other).

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchOnlineDonations,
  type OnlineDonation,
} from "../../../queries/onlineDonationQueries";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function levelLabel(level: string): string {
  const map: Record<string, string> = {
    bronze: "Bronze Friend",
    silver: "Silver Advocate",
    gold: "Gold Sponsor",
    platinum: "Platinum Champion",
    other: "Custom",
  };
  return map[level] ?? level;
}

function statusBadge(status: string) {
  const cls =
    status === "COMPLETED" || status === "ACTIVE"
      ? "bg-green-100 text-green-800"
      : status === "FAILED" || status === "CANCELED" || status === "DEACTIVATED"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-800";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

function giftTypeBadge(giftType: string) {
  const isMonthly = giftType === "monthly";
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${
        isMonthly
          ? "bg-purple-100 text-purple-800"
          : "bg-blue-100 text-blue-800"
      }`}
    >
      {isMonthly ? "Monthly" : "One-time"}
    </span>
  );
}

// ── Expanded detail panel ──────────────────────────────────────────────────

function DonationDetail({ d }: { d: OnlineDonation }) {
  const hasAddress =
    d.donorStreetAddress || d.donorCity || d.donorState || d.donorZip;
  const hasTribute = d.tributeEnabled && d.tributeType && d.tributeType !== "none";

  return (
    <div className="px-4 py-5 bg-gray-50 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-sm">
      {/* One-time payment info */}
      {d.squarePaymentId && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Square Payment ID
          </p>
          <p className="font-mono text-gray-700 break-all">{d.squarePaymentId}</p>
        </div>
      )}

      {/* Recurring subscription info */}
      {d.squareSubscriptionId && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Subscription ID
          </p>
          <p className="font-mono text-gray-700 break-all">{d.squareSubscriptionId}</p>
        </div>
      )}
      {d.squareCustomerId && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Square Customer ID
          </p>
          <p className="font-mono text-gray-700 break-all">{d.squareCustomerId}</p>
        </div>
      )}
      {d.startedAt && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Started
          </p>
          <p className="text-gray-700">{formatDate(d.startedAt)}</p>
        </div>
      )}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
          Environment
        </p>
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
            d.environment === "production"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {d.environment}
        </span>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
          Gift Type
        </p>
        <p className="text-gray-700">{d.giftType}</p>
      </div>

      {/* Donor contact */}
      {d.donorPhone && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Phone
          </p>
          <p className="text-gray-700">{d.donorPhone}</p>
        </div>
      )}
      {hasAddress && (
        <div className="sm:col-span-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Address
          </p>
          <p className="text-gray-700">
            {[
              d.donorStreetAddress,
              d.donorCity,
              d.donorState,
              d.donorZip,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      )}

      {/* Tribute */}
      {hasTribute && (
        <div className="sm:col-span-2 lg:col-span-3 border-t border-gray-200 pt-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Tribute Gift —{" "}
            {d.tributeType === "in-honor-of" ? "In Honor Of" : "In Memory Of"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {d.honoreeName && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Honoree</p>
                <p className="text-gray-700">{d.honoreeName}</p>
              </div>
            )}
            {d.notificationName && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Notify</p>
                <p className="text-gray-700">
                  {d.notificationName}
                  {d.notificationEmail && ` (${d.notificationEmail})`}
                </p>
              </div>
            )}
            {d.notificationAddress && (
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400 mb-0.5">Notification Address</p>
                <p className="text-gray-700">{d.notificationAddress}</p>
              </div>
            )}
            {d.tributeMessage && (
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400 mb-0.5">Message</p>
                <p className="text-gray-700 italic">{d.tributeMessage}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Receipt */}
      {d.receiptUrl && (
        <div className="sm:col-span-2 lg:col-span-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Receipt
          </p>
          <a
            href={d.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all hover:text-blue-800 transition-colors"
          >
            {d.receiptUrl}
          </a>
          {d.environment === "sandbox" && (
            <p className="text-xs text-yellow-700 mt-1">
              Sandbox receipt links may return 404 even when the payment
              succeeded. Verify in the Square Developer Console → Sandbox
              Dashboard.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

type GiftTypeFilter = "all" | "one-time" | "monthly";
type EnvFilter = "all" | "sandbox" | "production";

export default function Donations() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [giftTypeFilter, setGiftTypeFilter] = useState<GiftTypeFilter>("all");
  const [envFilter, setEnvFilter] = useState<EnvFilter>("all");

  const {
    data: donations = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin", "online-donations"],
    queryFn: () => fetchOnlineDonations({ limit: 200 }),
    staleTime: 30_000,
  });

  const filtered = donations.filter((d) => {
    if (giftTypeFilter !== "all" && d.giftType !== giftTypeFilter) return false;
    if (envFilter !== "all" && d.environment !== envFilter) return false;
    return true;
  });

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <p className="text-center text-gray-500 py-8">Loading donations…</p>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (isError) {
    const errorMessage = (error as Error)?.message ?? "Unknown error";
    const isAuthError =
      errorMessage.includes("401") ||
      errorMessage.includes("Invalid or expired token");
    return (
      <div className="text-center text-red-600 py-8">
        <p className="font-semibold">Failed to load donation records.</p>
        <p className="text-sm text-gray-500 mt-2">{errorMessage}</p>
        {isAuthError && (
          <p className="text-sm text-blue-600 mt-3">
            Try logging out and back in to refresh your session.
          </p>
        )}
        <button
          onClick={() => void refetch()}
          className="mt-4 px-4 py-2 text-sm bg-zontaGold text-white rounded-md hover:bg-zontaRed transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Main UI ──────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-zontaRed">
            Online Donations
          </h2>
          {donations.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {filtered.length === donations.length
                ? `${donations.length} record${donations.length !== 1 ? "s" : ""}`
                : `${filtered.length} of ${donations.length} records`}
            </p>
          )}
        </div>
        <button
          onClick={() => void refetch()}
          disabled={isFetching}
          className="px-4 py-2 text-sm bg-zontaGold text-white rounded-md shadow hover:bg-zontaRed transition disabled:opacity-50"
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Filters */}
      {donations.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 font-medium">Type:</label>
            {(["all", "one-time", "monthly"] as GiftTypeFilter[]).map((v) => (
              <button
                key={v}
                onClick={() => setGiftTypeFilter(v)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  giftTypeFilter === v
                    ? "bg-zontaGold text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {v === "all" ? "All" : v === "one-time" ? "One-time" : "Monthly"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 font-medium">Env:</label>
            {(["all", "sandbox", "production"] as EnvFilter[]).map((v) => (
              <button
                key={v}
                onClick={() => setEnvFilter(v)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  envFilter === v
                    ? "bg-zontaGold text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {v === "all" ? "All" : v}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {donations.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-base font-medium mb-1">
            No online donations have been recorded yet.
          </p>
          <p className="text-sm">
            Completed Square donations will appear here automatically.
          </p>
        </div>
      )}

      {/* Filtered-empty state */}
      {donations.length > 0 && filtered.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <p className="text-sm">No records match the current filters.</p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 border-b font-semibold text-gray-600">
                  Date
                </th>
                <th className="px-4 py-3 border-b font-semibold text-gray-600">
                  Type
                </th>
                <th className="px-4 py-3 border-b font-semibold text-gray-600">
                  Donor
                </th>
                <th className="px-4 py-3 border-b font-semibold text-gray-600">
                  Email
                </th>
                <th className="px-4 py-3 border-b font-semibold text-gray-600">
                  Amount
                </th>
                <th className="px-4 py-3 border-b font-semibold text-gray-600">
                  Level
                </th>
                <th className="px-4 py-3 border-b font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 border-b font-semibold text-gray-600">
                  Tribute
                </th>
                <th className="px-4 py-3 border-b font-semibold text-gray-600">
                  Receipt
                </th>
                <th className="px-4 py-3 border-b font-semibold text-gray-600 sr-only">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const isExpanded = expandedId === d._id;
                const displayStatus =
                  d.giftType === "monthly"
                    ? (d.subscriptionStatus ?? "ACTIVE")
                    : (d.squareStatus ?? "—");
                return (
                  <>
                    <tr
                      key={d._id}
                      className="border-b hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => toggleExpand(d._id)}
                    >
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatDate(d.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {giftTypeBadge(d.giftType)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                        {d.donorFirstName} {d.donorLastName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {d.donorEmail}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                        {formatAmount(d.amountCents)}
                        {d.giftType === "monthly" && (
                          <span className="text-xs font-normal text-gray-400 ml-1">/mo</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {levelLabel(d.givingLevel)}
                      </td>
                      <td className="px-4 py-3">
                        {statusBadge(displayStatus)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {d.tributeEnabled &&
                        d.tributeType &&
                        d.tributeType !== "none" ? (
                          <span
                            className="text-zontaGold font-bold"
                            title={
                              d.tributeType === "in-honor-of"
                                ? `In Honor of ${d.honoreeName ?? ""}`
                                : `In Memory of ${d.honoreeName ?? ""}`
                            }
                          >
                            ♥
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {d.giftType !== "monthly" && d.receiptUrl ? (
                          <a
                            href={d.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title={
                              d.environment === "sandbox"
                                ? "Sandbox receipt links may return 404 even when the payment succeeded"
                                : undefined
                            }
                            className="text-blue-600 underline text-xs hover:text-blue-800 transition-colors whitespace-nowrap"
                          >
                            {d.environment === "sandbox" ? "View*" : "View"}
                          </a>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {isExpanded ? "▲ Less" : "▼ Details"}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${d._id}-detail`}>
                        <td colSpan={10} className="p-0">
                          <DonationDetail d={d} />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
