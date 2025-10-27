import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface Order {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function DashboardHomeV2() {
  const { data, isLoading } = useQuery<Order[]>({
    queryKey: ["admin-v2", "orders-summary"],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v2/admin/orders`,
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

  // ===== Calculations =====
  const totalOrders = data?.length ?? 0;
  const totalRevenue = data?.reduce((sum, o) => sum + (o.total || 0), 0) ?? 0;
  const pendingOrders = data?.filter((o) => o.status === "Pending").length ?? 0;

  // ===== Monthly Revenue Data =====
  const monthlyData = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, number>();

    data.forEach((order) => {
      const month = new Date(order.createdAt).toLocaleString("default", {
        month: "short",
      });
      map.set(month, (map.get(month) || 0) + (order.total || 0));
    });

    return Array.from(map, ([month, revenue]) => ({ month, revenue }));
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
        <SummaryCard title="Members" value="—" />
      </div>

      {/* ===== Dashboard Insights ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ===== Monthly Revenue Chart ===== */}
        <div className="bg-white rounded-xl shadow-sm border border-zontaGold p-6">
          <h2 className="font-semibold text-zontaRed mb-4">
            Monthly Revenue
          </h2>
          {isLoading ? (
            <p className="text-gray-500 text-sm">Loading chart...</p>
          ) : monthlyData.length === 0 ? (
            <p className="text-gray-500 text-sm">No revenue data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="#c6862c"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="#c6862c"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#c6862c"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
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