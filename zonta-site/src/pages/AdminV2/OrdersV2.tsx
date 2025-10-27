import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Order {
  _id: string;
  email: string;
  total: number;
  status: "Pending" | "Completed" | "Cancelled" | "Paid";
  createdAt: string;
}

// --- helpers ---
function getAuthHeaders() {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Not authorized — please log in again.");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function fetchOrders(): Promise<Order[]> {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/v2/admin/orders`,
    {
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch orders: ${text}`);
  }
  return res.json();
}

async function patchOrderStatus({
  id,
  status,
}: {
  id: string;
  status: "Pending" | "Completed" | "Cancelled" | "Paid";
}) {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/v2/admin/orders/update-status`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, status }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update status: ${text}`);
  }

  return res.json();
}

// --- component ---
export default function OrdersV2() {
  const queryClient = useQueryClient();

  // UI State / controls
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Completed" | "Cancelled" | "Paid">("All");
  const [dateRange, setDateRange] = useState<"All" | "7" | "30">("All");
  const [sortOrder, setSortOrder] = useState<"Newest" | "Oldest" | "HighTotal" | "LowTotal">("Newest");
  const [search, setSearch] = useState("");

  // Data fetch
  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery<Order[]>({
    queryKey: ["admin-v2", "orders"],
    queryFn: fetchOrders,
    staleTime: 60_000,
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: patchOrderStatus,
    onSuccess: () => {
      // refetch orders after update
      queryClient.invalidateQueries({ queryKey: ["admin-v2", "orders"] });
    },
  });

  // Filter + sort logic (memoized)
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    // filter by status
    if (statusFilter !== "All") {
      list = list.filter((o) => o.status === statusFilter);
    }

    // search by email
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      list = list.filter((o) => o.email.toLowerCase().includes(q));
    }

    // date range filter
    if (dateRange !== "All") {
      const now = Date.now();
      const cutoffMs =
        dateRange === "7"
          ? 7 * 24 * 60 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000;
      const cutoff = now - cutoffMs;

      list = list.filter(
        (o) => new Date(o.createdAt).getTime() >= cutoff
      );
    }

    // sort
    list.sort((a, b) => {
      switch (sortOrder) {
        case "Newest":
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        case "Oldest":
          return (
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
          );
        case "HighTotal":
          return b.total - a.total;
        case "LowTotal":
          return a.total - b.total;
        default:
          return 0;
      }
    });

    return list;
  }, [orders, statusFilter, search, dateRange, sortOrder]);

  // little helper to color the chip
  const renderStatusBadge = (status: Order["status"]) => {
    const base =
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
    if (status === "Paid" || status === "Completed") {
      return (
        <span className={`${base} bg-green-100 text-green-700`}>
          {status}
        </span>
      );
    }
    if (status === "Pending") {
      return (
        <span className={`${base} bg-yellow-100 text-yellow-800`}>
          {status}
        </span>
      );
    }
    if (status === "Cancelled") {
      return (
        <span className={`${base} bg-red-100 text-red-700`}>{status}</span>
      );
    }
    return (
      <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>
    );
  };

  // handler for status dropdown
  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    statusMutation.mutate({ id: orderId, status: newStatus });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ===== Header bar ===== */}
      <div className="px-5 py-4 border-b border-gray-200 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="font-semibold text-zontaRed text-lg">Orders</h2>

        {/* Filters row */}
        <div className="flex flex-col md:flex-row flex-wrap gap-3 text-sm">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as
                  | "All"
                  | "Pending"
                  | "Completed"
                  | "Cancelled"
                  | "Paid"
              )
            }
            className="border border-zontaGold rounded-md px-3 py-2"
            aria-label="Status Filter"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(
                e.target.value as
                  | "Newest"
                  | "Oldest"
                  | "HighTotal"
                  | "LowTotal"
              )
            }
            className="border border-zontaGold rounded-md px-3 py-2"
            aria-label="Sort Order"
          >
            <option value="Newest">Newest First</option>
            <option value="Oldest">Oldest First</option>
            <option value="HighTotal">Highest Total</option>
            <option value="LowTotal">Lowest Total</option>
          </select>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) =>
              setDateRange(e.target.value as "All" | "7" | "30")
            }
            className="border border-zontaGold rounded-md px-3 py-2"
            aria-label="Date Range"
          >
            <option value="All">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email…"
            className="border border-zontaGold rounded-md px-3 py-2 min-w-[180px]"
          />
        </div>
      </div>

      {/* ===== Table wrapper ===== */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Email</th>
              <th className="text-left px-5 py-3 font-medium">Total</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-left px-5 py-3 font-medium">Date</th>
              <th className="text-left px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Loading row */}
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-5 py-4 text-gray-500">
                  Loading…
                </td>
              </tr>
            )}

            {/* Error row */}
            {error && !isLoading && (
              <tr>
                <td colSpan={5} className="px-5 py-4 text-red-600">
                  {(error as Error).message}
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!isLoading &&
              !error &&
              filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  className="border-t border-gray-100 hover:bg-zontaGold/5"
                >
                  <td className="px-5 py-3 text-gray-800">{order.email}</td>

                  <td className="px-5 py-3 font-medium text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>

                  <td className="px-5 py-3">{renderStatusBadge(order.status)}</td>

                  <td className="px-5 py-3 text-gray-700">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      {/* Change Status Dropdown */}
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order._id,
                            e.target.value as Order["status"]
                          )
                        }
                        disabled={statusMutation.isPending}
                        className="border border-zontaGold rounded-md px-2 py-1 text-xs"
                        aria-label="Update Order Status"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      {/* View Button (placeholder for future drawer/modal) */}
                      <button
                        className="text-xs bg-zontaGold text-white px-3 py-1 rounded-md hover:bg-zontaRed transition"
                        onClick={() => {
                          // TODO: open drawer or modal w/ full details
                          alert(`View details for ${order._id}`);
                        }}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {/* Empty state */}
            {!isLoading &&
              !error &&
              filteredOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    No matching orders.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
}