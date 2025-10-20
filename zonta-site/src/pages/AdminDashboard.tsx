import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOrders,
  updateOrderStatus,
  type Order,
} from "../queries/orderQueries";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ✅ Decode JWT to check expiry
function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ✅ Auto logout if token expired
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      const decoded = parseJwt(token);
      const now = Date.now() / 1000;
      if (decoded?.exp && decoded.exp < now) {
        localStorage.removeItem("adminToken");
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // ✅ Fetch all orders
  const { data: orders = [], isLoading, isError } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 2,
  });

  // ✅ Mutation for updating status
  const mutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  // ✅ UI State: filters & sorting
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("Newest");
  const [dateRange, setDateRange] = useState<string>("All");
  const [search, setSearch] = useState("");

  // ✅ Handle updates
  const handleStatusChange = (id: string, status: string) => {
    mutation.mutate({ id, status: status as "Pending" | "Completed" | "Cancelled" });
  };

  // ✅ Handle logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  // ✅ Compute statistics
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const pending = orders.filter((o) => o.status === "Pending").length;
    const completed = orders.filter((o) => o.status === "Completed").length;
    const cancelled = orders.filter((o) => o.status === "Cancelled").length;

    // Monthly revenue data
    const monthlyData = orders.reduce((acc, o) => {
      const month = new Date(o.createdAt).toLocaleString("default", {
        month: "short",
      });
      const existing = acc.find((d) => d.name === month);
      if (existing) existing.revenue += o.total;
      else acc.push({ name: month, revenue: o.total });
      return acc;
    }, [] as { name: string; revenue: number }[]);

    return { totalRevenue, pending, completed, cancelled, monthlyData };
  }, [orders]);

  // ✅ Pie chart data
  const pieData = [
    { name: "Pending", value: stats.pending },
    { name: "Completed", value: stats.completed },
    { name: "Cancelled", value: stats.cancelled },
  ];
  const pieColors = ["#f59e0b", "#16a34a", "#dc2626"];

  // ✅ Export filtered orders to CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;

    const headers = ["Email", "Total ($)", "Status", "Created At"];
    const csvData = filteredOrders.map((o) => [
      o.email,
      o.total.toFixed(2),
      o.status,
      new Date(o.createdAt).toLocaleString(),
    ]);

    const csvContent =
      [headers, ...csvData]
        .map((row) => row.map((v) => `"${v}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zonta_orders_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ✅ Filter + Sort Logic
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (statusFilter !== "All")
      filtered = filtered.filter((o) => o.status === statusFilter);

    if (search.trim())
      filtered = filtered.filter((o) =>
        o.email.toLowerCase().includes(search.toLowerCase())
      );

    const now = new Date();
    if (dateRange === "7") {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((o) => new Date(o.createdAt) >= cutoff);
    } else if (dateRange === "30") {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((o) => new Date(o.createdAt) >= cutoff);
    }

    switch (sortOrder) {
      case "Newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "Oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "HighTotal":
        filtered.sort((a, b) => b.total - a.total);
        break;
      case "LowTotal":
        filtered.sort((a, b) => a.total - b.total);
        break;
    }

    return filtered;
  }, [orders, statusFilter, sortOrder, search, dateRange]);

  // ✅ Loading / Error States
  if (isLoading)
    return <p className="text-center py-20">Loading orders...</p>;
  if (isError)
    return (
      <p className="text-center py-20 text-red-600">
        Failed to load orders.
      </p>
    );

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto relative">
      {/* ===== Top Bar ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-zontaRed mb-4 sm:mb-0">
          Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="bg-zontaGold text-white px-4 py-2 rounded-md font-semibold hover:bg-zontaDark transition"
        >
          Sign Out
        </button>
      </div>

      {/* ===== Stats Summary ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white shadow-md rounded-xl border border-zontaGold p-6 text-center">
          <h3 className="text-zontaDark text-sm font-semibold mb-2">
            Total Revenue
          </h3>
          <p className="text-2xl font-bold text-zontaRed">
            ${stats.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-white shadow-md rounded-xl border border-zontaGold p-6 text-center">
          <h3 className="text-zontaDark text-sm font-semibold mb-2">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white shadow-md rounded-xl border border-zontaGold p-6 text-center">
          <h3 className="text-zontaDark text-sm font-semibold mb-2">
            Completed
          </h3>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white shadow-md rounded-xl border border-zontaGold p-6 text-center">
          <h3 className="text-zontaDark text-sm font-semibold mb-2">
            Cancelled
          </h3>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* ===== Charts Section ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        {/* Monthly Revenue Chart */}
        <div className="bg-white border border-zontaGold rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-zontaRed mb-4">
            Monthly Revenue
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#c6862c" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Status Chart */}
        <div className="bg-white border border-zontaGold rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-zontaRed mb-4">
            Orders by Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== Filters Section ===== */}
      <div className="flex flex-col lg:flex-row flex-wrap justify-between items-center gap-4 mb-8">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-zontaGold rounded-md px-3 py-2 text-sm"
          aria-label="Filter by order status"
        >
          <option value="All">All Orders</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border border-zontaGold rounded-md px-3 py-2 text-sm"
          aria-label="Sort order"
        >
          <option value="Newest">Newest First</option>
          <option value="Oldest">Oldest First</option>
          <option value="HighTotal">Highest Total</option>
          <option value="LowTotal">Lowest Total</option>
        </select>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="border border-zontaGold rounded-md px-3 py-2 text-sm"
          aria-label="Filter by date range"
        >
          <option value="All">All Time</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
        </select>

        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-zontaGold rounded-md px-3 py-2 text-sm flex-1 min-w-[200px]"
          aria-label="Search orders by email"
        />

        <button
          onClick={handleExportCSV}
          className="bg-zontaGold text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-zontaDark transition"
          aria-label="Export orders to CSV"
        >
          Export CSV
        </button>
      </div>

      {/* ===== Orders Table ===== */}
      {filteredOrders.length === 0 ? (
        <p className="text-center text-zontaDark/70">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-zontaGold text-left">
            <thead className="bg-zontaGold text-white">
              <tr>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order: Order) => (
                <tr key={order._id} className="border-b border-zontaGold/40">
                  <td className="px-4 py-2">{order.email}</td>
                  <td className="px-4 py-2">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-2">{order.status}</td>
                  <td className="px-4 py-2">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className="border border-zontaGold rounded-md px-2 py-1 text-sm"
                      aria-label={`Change status for order ${order._id}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}