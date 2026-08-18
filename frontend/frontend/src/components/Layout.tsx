import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  RotateCcw,
  LifeBuoy,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/products", label: "Products", icon: Package },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/refunds", label: "Refunds", icon: RotateCcw },
  { to: "/support-tickets", label: "Support", icon: LifeBuoy },
  { to: "/chat", label: "AI Assistant", icon: MessageCircle },
];

function currentTitle(pathname: string) {
  const match = NAV_ITEMS.find((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to),
  );
  return match?.label ?? "Storefront";
}

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen md:pl-64">
      <Sidebar />

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0"
            style={{ background: "rgba(8,6,18,0.6)" }}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="fixed inset-y-0 left-0 flex w-64 flex-col gap-1 border-r px-3 py-5"
            style={{ borderColor: "var(--border)", background: "var(--bg-elevated)" }}
          >
            <div className="mb-4 flex items-center justify-between px-2">
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Storefront
              </span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={18} style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium"
                style={({ isActive }) =>
                  isActive
                    ? { color: "var(--text-primary)", background: "var(--surface)" }
                    : { color: "var(--text-secondary)" }
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Topbar */}
      <header
        className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b px-4 backdrop-blur-md md:px-8"
        style={{
          borderColor: "var(--border)",
          background: "color-mix(in srgb, var(--bg-elevated) 85%, transparent)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            className="rounded-md p-1.5 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} style={{ color: "var(--text-primary)" }} />
          </button>
          <h2
            className="text-sm font-medium md:hidden"
            style={{ color: "var(--text-primary)" }}
          >
            {currentTitle(location.pathname)}
          </h2>
        </div>
        <ThemeToggle />
      </header>

      <main className="px-4 py-6 md:px-8 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
