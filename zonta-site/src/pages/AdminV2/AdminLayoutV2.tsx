import { useState, useMemo } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import ZontaLogo from "../../assets/Zonta_emblem.png";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  end?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: Package },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/scholarships", label: "Scholarships", icon: BookOpen },
  { to: "/admin/memberships", label: "Memberships", icon: BookOpen },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayoutV2() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const title = useMemo(() => {
    const match = NAV_ITEMS.find((item) =>
      location.pathname.startsWith(item.to)
    );
    return match?.label ?? "Admin";
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 relative -mt-4">
      {/* ===== Sidebar (Desktop) ===== */}
      <aside className="hidden md:flex w-64 flex-col bg-zontaRed text-white">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/15">
          <img src={ZontaLogo} alt="Zonta" className="w-9 h-9 object-contain" />
          <div className="font-bold leading-tight">
            <div className="text-base">Zonta Admin</div>
            <div className="text-[11px] opacity-80">v2 Control Panel</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive
                    ? "bg-zontaGold text-black"
                    : "text-white/90 hover:bg-white/10"
                }`
              }
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="m-3 mt-auto inline-flex items-center gap-2 px-3 py-2.5 rounded-md bg-white/10 hover:bg-white/15 transition"
        >
          <LogOut size={18} />
          <span className="text-sm">Logout</span>
        </button>
      </aside>

      {/* ===== Mobile Sidebar ===== */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed z-50 top-0 left-0 h-full w-72 bg-zontaRed text-white transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/15">
          <div className="flex items-center gap-3">
            <img src={ZontaLogo} alt="Zonta" className="w-9 h-9 object-contain" />
            <div className="font-bold leading-tight">
              <div className="text-base">Zonta Admin</div>
              <div className="text-[11px] opacity-80">v2 Control Panel</div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-2 hover:bg-white/10"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive
                    ? "bg-zontaGold text-black"
                    : "text-white/90 hover:bg-white/10"
                }`
              }
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => {
            setOpen(false);
            handleLogout();
          }}
          className="m-3 mt-auto inline-flex items-center gap-2 px-3 py-2.5 rounded-md bg-white/10 hover:bg-white/15 transition"
        >
          <LogOut size={18} />
          <span className="text-sm">Logout</span>
        </button>
      </aside>

      {/* ===== Main Section ===== */}
      <section className="flex-1 min-w-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between bg-white/90 backdrop-blur border-b border-gray-200 px-4 md:px-6 py-3 shadow-sm">
          {/* Page title & menu button */}
          <div className="flex items-center gap-3">
            {/* ✅ Moved menu button here */}
            <button
              onClick={() => setOpen(true)}
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition"
              aria-label="Open menu"
            >
              <Menu size={20} className="text-zontaRed" />
            </button>

            <h1 className="text-lg font-semibold text-zontaRed">{title}</h1>
          </div>
        </div>

        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </section>
    </div>
  );
}