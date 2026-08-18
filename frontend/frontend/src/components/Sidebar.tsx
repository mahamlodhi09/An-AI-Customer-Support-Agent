import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  RotateCcw,
  LifeBuoy,
  MessageCircle,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/products", label: "Products", icon: Package },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/refunds", label: "Refunds", icon: RotateCcw },
  { to: "/support-tickets", label: "Support", icon: LifeBuoy },
  { to: "/chat", label: "AI Assistant", icon: MessageCircle },
];

export function Sidebar() {
  return (
    <aside
      className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r px-3 py-5 md:flex"
      style={{ borderColor: "var(--border)", background: "var(--bg-elevated)" }}
    >
      <div className="mb-6 flex items-center gap-2.5 px-2.5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
          style={{
            backgroundImage: "var(--accent-gradient)",
            boxShadow: "var(--accent-glow)",
          }}
        >
          S
        </div>
        <div>
          <p
            className="text-sm font-semibold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Storefront
          </p>
          <p
            className="text-[11px] leading-tight"
            style={{ color: "var(--text-muted)" }}
          >
            Admin console
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            style={({ isActive }) =>
              isActive
                ? { color: "var(--text-primary)", background: "var(--surface)" }
                : { color: "var(--text-secondary)" }
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full"
                    style={{ backgroundImage: "var(--accent-gradient)" }}
                  />
                )}
                <Icon
                  size={17}
                  style={{
                    color: isActive ? "var(--accent-violet)" : "var(--text-muted)",
                  }}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div
        className="rounded-lg border px-3 py-2.5 text-xs"
        style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
      >
        Connected to
        <span
          className="ml-1 font-mono"
          style={{ color: "var(--text-secondary)" }}
        >
          {import.meta.env.VITE_API_URL || "http://localhost:3000"}
        </span>
      </div>
    </aside>
  );
}
