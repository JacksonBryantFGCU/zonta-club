// zonta-site/src/pages/Admin/DashboardHome.tsx

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface Order {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function DashboardHome() {
  const { data, isLoading } = useQuery<Order[]>({
    queryKey: ["admin", "orders-summary"],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken") ?? ""}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
    staleTime: 60_000,
  });

  // ===== Fetch Membership Applications Count =====
  const { data: membershipData, isLoading: isLoadingMemberships } = useQuery<{
    count: number;
  }>({
    queryKey: ["admin", "membership-count"],
    queryFn: async () => {
      const res = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/admin/memberships/applications/count`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken") ?? ""}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch membership count");
      return res.json();
    },
    staleTime: 60_000,
  });

  // ===== Calculations =====
  const totalOrders = data?.length ?? 0;
  const totalRevenue = data?.reduce((sum, o) => sum + (o.total || 0), 0) ?? 0;
  const pendingOrders = data?.filter((o) => o.status === "Pending").length ?? 0;
  const membershipCount = membershipData?.count ?? 0;

  // ===== Chart Type Toggle =====
  const [chartType, setChartType] = useState<
    "daily" | "volume" | "distribution"
  >("daily");

  // ===== Daily Orders Data (Last 30 Days) =====
  const dailyOrdersData = useMemo(() => {
    if (!data) return [];

    const last30Days = new Map<
      string,
      { date: string; orders: number; revenue: number }
    >();
    const today = new Date();

    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      last30Days.set(dateStr, { date: dateStr, orders: 0, revenue: 0 });
    }

    // Count orders per day
    data.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const dateStr = orderDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const existing = last30Days.get(dateStr);
      if (existing) {
        existing.orders += 1;
        existing.revenue += order.total || 0;
      }
    });

    return Array.from(last30Days.values());
  }, [data]);

  // ===== Order Volume by Price Range =====
  const orderDistribution = useMemo(() => {
    if (!data) return [];

    const ranges = [
      { range: "$0-25", min: 0, max: 25, count: 0 },
      { range: "$25-50", min: 25, max: 50, count: 0 },
      { range: "$50-100", min: 50, max: 100, count: 0 },
      { range: "$100-250", min: 100, max: 250, count: 0 },
      { range: "$250+", min: 250, max: Infinity, count: 0 },
    ];

    data.forEach((order) => {
      const total = order.total || 0;
      const range = ranges.find((r) => total >= r.min && total < r.max);
      if (range) range.count += 1;
    });

    return ranges;
  }, [data]);

  // ===== Weekly Order Volume =====
  const weeklyVolume = useMemo(() => {
    if (!data) return [];

    const weeks = new Map<
      string,
      { week: string; orders: number; revenue: number }
    >();

    data.forEach((order) => {
      const date = new Date(order.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekStr = weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      if (!weeks.has(weekStr)) {
        weeks.set(weekStr, { week: weekStr, orders: 0, revenue: 0 });
      }

      const week = weeks.get(weekStr)!;
      week.orders += 1;
      week.revenue += order.total || 0;
    });

    return Array.from(weeks.values()).sort((a, b) => {
      return new Date(a.week).getTime() - new Date(b.week).getTime();
    });
  }, [data]);

  // ===== Recent Orders (latest 5) =====
  const recentOrders = useMemo(() => {
    if (!data) return [];
    return [...data]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [data]);

  return (
    <div className="space-y-8">
      {/* ===== Summary Cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Orders"
          value={isLoading ? "..." : totalOrders}
        />
        <SummaryCard
          title="Revenue"
          value={isLoading ? "..." : `$${totalRevenue.toFixed(2)}`}
        />
        <SummaryCard
          title="Pending"
          value={isLoading ? "..." : pendingOrders}
        />
        <SummaryCard
          title="Members"
          value={isLoadingMemberships ? "..." : membershipCount}
        />
      </div>

      {/* ===== Dashboard Insights ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ===== Order Analytics Chart ===== */}
        <div className="bg-white rounded-xl shadow-sm border border-zontaGold p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zontaRed">Order Analytics</h2>
            <select
              value={chartType}
              onChange={(e) =>
                setChartType(
                  e.target.value as "daily" | "volume" | "distribution"
                )
              }
              className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-zontaGold"
              aria-label="Select chart type"
            >
              <option value="daily">Daily Orders (30d)</option>
              <option value="volume">Weekly Volume</option>
              <option value="distribution">Price Distribution</option>
            </select>
          </div>

          {isLoading ? (
            <p className="text-gray-500 text-sm">Loading chart...</p>
          ) : (
            <>
              {chartType === "daily" && (
                <ResponsiveContainer width="100%" height={300}>
                  {dailyOrdersData.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-sm">
                        No order data yet.
                      </p>
                    </div>
                  ) : (
                    <AreaChart data={dailyOrdersData}>
                      <defs>
                        <linearGradient
                          id="colorOrders"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#9b1c1c"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#9b1c1c"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ fontSize: "12px" }}
                        formatter={(value: number, name: string) => {
                          if (name === "orders") return [value, "Orders"];
                          if (name === "revenue")
                            return [`$${value.toFixed(2)}`, "Revenue"];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="orders"
                        stroke="#9b1c1c"
                        fillOpacity={1}
                        fill="url(#colorOrders)"
                        name="Orders"
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              )}

              {chartType === "volume" && (
                <ResponsiveContainer width="100%" height={300}>
                  {weeklyVolume.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-sm">
                        No order data yet.
                      </p>
                    </div>
                  ) : (
                    <BarChart data={weeklyVolume}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ fontSize: "12px" }}
                        formatter={(value: number, name: string) => {
                          if (name === "orders") return [value, "Orders"];
                          if (name === "revenue")
                            return [`$${value.toFixed(2)}`, "Revenue"];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Bar dataKey="orders" fill="#9b1c1c" name="Orders" />
                      <Bar dataKey="revenue" fill="#c6862c" name="Revenue" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}

              {chartType === "distribution" && (
                <ResponsiveContainer width="100%" height={300}>
                  {orderDistribution.every((d) => d.count === 0) ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-sm">
                        No order data yet.
                      </p>
                    </div>
                  ) : (
                    <BarChart data={orderDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ fontSize: "12px" }}
                        formatter={(value: number) => [value, "Orders"]}
                      />
                      <Bar dataKey="count" fill="#c6862c" name="Order Count" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </>
          )}
        </div>

        {/* ===== Recent Orders ===== */}
        <div className="bg-white rounded-xl shadow-sm border border-zontaGold p-6">
          <h2 className="font-semibold text-zontaRed mb-4">Recent Orders</h2>

          {isLoading ? (
            <p className="text-gray-500 text-sm">Loading orders...</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent orders found.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex justify-between py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      ${order.total.toFixed(2)}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==============================
   🧱 SummaryCard Component
============================== */
function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 border-l-4 border-zontaGold">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-zontaRed">{value}</div>
    </div>
  );
}
