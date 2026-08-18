import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Users,
  ShoppingCart,
  RotateCcw,
  LifeBuoy,
  ArrowUpRight,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { productsApi } from "../api/products";
import { customersApi } from "../api/customers";
import { ordersApi } from "../api/orders";
import { refundsApi } from "../api/refunds";
import { supportTicketsApi } from "../api/supportTickets";
import type { Order, Refund, SupportTicket } from "../api/types";
import { StatCard } from "../components/StatCard";
import { PageHeader, LoadingState, ErrorState } from "../components/PageState";
import { StatusBadge } from "../components/Badge";
import { useTheme } from "../context/ThemeContext";

interface DashboardData {
  productCount: number;
  customerCount: number;
  orders: Order[];
  refunds: Refund[];
  tickets: SupportTicket[];
}

const STATUS_ORDER = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      productsApi.list(),
      customersApi.list(),
      ordersApi.list(),
      refundsApi.list(),
      supportTicketsApi.list(),
    ])
      .then(([products, customers, orders, refunds, tickets]) => {
        if (cancelled) return;
        setData({
          productCount: products.length,
          customerCount: customers.length,
          orders,
          refunds,
          tickets,
        });
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = useMemo(() => {
    if (!data) return [];
    return STATUS_ORDER.map((status) => ({
      status,
      count: data.orders.filter((o) => o.status === status).length,
    }));
  }, [data]);

  const recentOrders = useMemo(
    () =>
      data
        ? [...data.orders]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )
            .slice(0, 6)
        : [],
    [data],
  );

  const openTickets = useMemo(
    () => data?.tickets.filter((t) => t.status === "OPEN").length ?? 0,
    [data],
  );

  const pendingRefunds = useMemo(
    () => data?.refunds.filter((r) => r.status === "PENDING").length ?? 0,
    [data],
  );

  if (error) return <ErrorState message={error} />;
  if (!data) return <LoadingState label="Loading dashboard" />;

  const axisColor = theme === "dark" ? "#6f6790" : "#8a83a8";
  const gridColor = theme === "dark" ? "#221d3d" : "#ece8f7";

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="A live snapshot of your storefront, straight from Postgres."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Products"
          value={data.productCount}
          icon={<Package size={18} />}
          accent="violet"
        />
        <StatCard
          label="Customers"
          value={data.customerCount}
          icon={<Users size={18} />}
          accent="blue"
        />
        <StatCard
          label="Orders"
          value={data.orders.length}
          icon={<ShoppingCart size={18} />}
          accent="violet"
        />
        <StatCard
          label="Pending refunds"
          value={pendingRefunds}
          icon={<RotateCcw size={18} />}
          accent="warning"
        />
        <StatCard
          label="Open tickets"
          value={openTickets}
          icon={<LifeBuoy size={18} />}
          accent="success"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <div
          className="rounded-2xl border p-5 lg:col-span-2"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <h3
            className="mb-4 text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Orders by status
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridColor}
                vertical={false}
              />
              <XAxis
                dataKey="status"
                tick={{ fontSize: 10, fill: axisColor }}
                tickFormatter={(v: string) => v.slice(0, 4)}
                axisLine={{ stroke: gridColor }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: axisColor }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip
                cursor={{ fill: "var(--surface-hover)" }}
                contentStyle={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  fontSize: 12,
                  color: "var(--text-primary)",
                }}
              />
              <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b7cf6" />
                  <stop offset="100%" stopColor="#5ea8f5" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div
          className="rounded-2xl border p-5 lg:col-span-3"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Recent orders
            </h3>
            <Link
              to="/orders"
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: "var(--accent-violet)" }}
            >
              View all <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="flex flex-col divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {recentOrders.map((order) => (
              <Link
                to={`/orders/${order.id}`}
                key={order.id}
                className="flex items-center justify-between py-2.5 transition-colors first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    #{order.id}
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {order.customer?.name ?? `Customer #${order.customerId}`}
                  </span>
                </div>
                <StatusBadge status={order.status} />
              </Link>
            ))}
            {recentOrders.length === 0 && (
              <p
                className="py-6 text-center text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                No orders yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
