// zonta-site/src/pages/Admin/DashboardHome.tsx

import { useMemo } from "react";
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
import { Users, GraduationCap, Calendar, HandHeart } from "lucide-react";

interface MembershipApplication {
  _id: string;
  name: string;
  email: string;
  status?: string;
  paid?: boolean;
  createdAt: string;
}

interface ScholarshipApplication {
  _id: string;
  name: string;
  email: string;
  status?: string;
  createdAt: string;
}

interface EventDoc {
  _id: string;
  title: string;
  date: string;
}

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken") ?? ""}`,
});

const fetchJson = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
};

export default function DashboardHome() {
  const base = import.meta.env.VITE_BACKEND_URL;

  const { data: memberships, isLoading: loadingApps } = useQuery<
    MembershipApplication[]
  >({
    queryKey: ["admin", "membership-applications"],
    queryFn: () => fetchJson(`${base}/api/admin/membership-applications`),
    staleTime: 60_000,
  });

  const { data: scholarships, isLoading: loadingSch } = useQuery<
    ScholarshipApplication[]
  >({
    queryKey: ["admin", "scholarship-applications"],
    queryFn: () => fetchJson(`${base}/api/admin/scholarship-applications`),
    staleTime: 60_000,
  });

  const { data: events, isLoading: loadingEvents } = useQuery<EventDoc[]>({
    queryKey: ["admin", "events"],
    queryFn: () => fetchJson(`${base}/api/admin/events`),
    staleTime: 60_000,
  });

  const { data: activeMembers, isLoading: loadingMembers } = useQuery<
    { _id: string }[]
  >({
    queryKey: ["admin", "memberships"],
    queryFn: () => fetchJson(`${base}/api/admin/memberships`),
    staleTime: 60_000,
  });

  const totalApps = memberships?.length ?? 0;
  const paidApps = memberships?.filter((m) => m.paid).length ?? 0;
  const pendingApps = totalApps - paidApps;
  const totalScholarships = scholarships?.length ?? 0;
  const totalEvents = events?.length ?? 0;
  const totalMembers = activeMembers?.length ?? 0;

  const upcomingEvents = useMemo(() => {
    if (!events) return 0;
    const now = new Date();
    return events.filter((e) => new Date(e.date) >= now).length;
  }, [events]);

  const applicationsTrend = useMemo(() => {
    const days = new Map<
      string,
      { date: string; memberships: number; scholarships: number }
    >();
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      days.set(label, { date: label, memberships: 0, scholarships: 0 });
    }

    const bucket = (iso: string, key: "memberships" | "scholarships") => {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return;
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const entry = days.get(label);
      if (entry) entry[key] += 1;
    };

    memberships?.forEach((m) => m.createdAt && bucket(m.createdAt, "memberships"));
    scholarships?.forEach(
      (s) => s.createdAt && bucket(s.createdAt, "scholarships")
    );

    return Array.from(days.values());
  }, [memberships, scholarships]);

  const statusBreakdown = useMemo(() => {
    const counts = { Paid: 0, Pending: 0, Approved: 0, Rejected: 0 } as Record<
      string,
      number
    >;
    memberships?.forEach((m) => {
      if (m.paid) counts.Paid += 1;
      else counts.Pending += 1;
    });
    scholarships?.forEach((s) => {
      const key = s.status === "approved" ? "Approved" : s.status === "rejected" ? "Rejected" : "Pending";
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [memberships, scholarships]);

  const recentApplications = useMemo(() => {
    if (!memberships) return [];
    return [...memberships]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [memberships]);

  const isLoading =
    loadingApps || loadingSch || loadingEvents || loadingMembers;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zontaRed">Welcome back</h2>
        <p className="text-gray-600 mt-1">
          Overview of memberships, scholarships, events, and donations.
        </p>
      </div>

      {/* ===== Stat Cards ===== */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users size={22} />}
          label="Active Members"
          value={isLoading ? "…" : totalMembers}
          tint="bg-zontaRed/10 text-zontaRed"
        />
        <StatCard
          icon={<HandHeart size={22} />}
          label="Membership Applications"
          value={isLoading ? "…" : `${pendingApps} pending`}
          sub={`${paidApps} paid · ${totalApps} total`}
          tint="bg-zontaGold/10 text-zontaGold"
        />
        <StatCard
          icon={<GraduationCap size={22} />}
          label="Scholarship Applications"
          value={isLoading ? "…" : totalScholarships}
          tint="bg-zontaBlue/10 text-zontaBlue"
        />
        <StatCard
          icon={<Calendar size={22} />}
          label="Upcoming Events"
          value={isLoading ? "…" : upcomingEvents}
          sub={`${totalEvents} total`}
          tint="bg-zontaViolet/10 text-zontaViolet"
        />
      </div>

      {/* ===== Applications Trend ===== */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-zontaDark">
              Applications — Last 30 Days
            </h3>
            <p className="text-sm text-gray-500">
              New membership and scholarship submissions over time.
            </p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={applicationsTrend}>
              <defs>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b0062c" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#b0062c" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="schGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0a6ba0" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#0a6ba0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={4} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="memberships"
                name="Memberships"
                stroke="#b0062c"
                fill="url(#memGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="scholarships"
                name="Scholarships"
                stroke="#0a6ba0"
                fill="url(#schGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ===== Status Breakdown + Recent Applications ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-zontaDark mb-4">
            Application Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#d4a017" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-zontaDark mb-4">
            Recent Membership Applications
          </h3>
          {recentApplications.length === 0 ? (
            <p className="text-sm text-gray-500">No applications yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentApplications.map((m) => (
                <li
                  key={m._id}
                  className="py-3 flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-medium text-zontaDark">{m.name}</p>
                    <p className="text-gray-500 text-xs">{m.email}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        m.paid
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {m.paid ? "Paid" : "Pending"}
                    </span>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  tint: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${tint}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-zontaDark">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}
