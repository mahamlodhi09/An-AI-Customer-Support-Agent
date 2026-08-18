import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, LifeBuoy, Mail, MapPin, Phone, RotateCcw } from "lucide-react";
import { ordersApi } from "../api/orders";
import type { Order } from "../api/types";
import { LoadingState, ErrorState } from "../components/PageState";
import { StatusBadge } from "../components/Badge";
import { Button } from "../components/Button";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    ordersApi
      .get(Number(id))
      .then(setOrder)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!order) return <LoadingState label="Loading order" />;

  const total = order.items.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0,
  );

  return (
    <div>
      <button
        onClick={() => navigate("/orders")}
        className="mb-4 flex items-center gap-1.5 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        <ArrowLeft size={15} /> Back to orders
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="font-mono text-2xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Order #{order.id}
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<RotateCcw size={15} />}
            onClick={() =>
              navigate("/refunds", { state: { orderId: order.id } })
            }
          >
            File a refund
          </Button>
          <Button
            variant="secondary"
            icon={<LifeBuoy size={15} />}
            onClick={() =>
              navigate("/support-tickets", {
                state: { orderId: order.id, customerId: order.customerId },
              })
            }
          >
            Open a ticket
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div
          className="rounded-2xl border lg:col-span-2"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div
            className="border-b px-5 py-3.5"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Items
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 px-5 py-3.5"
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {item.product?.title ?? `Product #${item.productId}`}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {item.product?.category}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Qty <span className="font-mono">{item.quantity}</span>
                  </span>
                  <span
                    className="w-16 text-right font-mono font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    ${((item.product?.price ?? 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div
            className="flex items-center justify-between border-t px-5 py-3.5"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Total
            </span>
            <span
              className="font-mono text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        <div
          className="h-fit rounded-2xl border p-5"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Customer
          </h3>
          {order.customer ? (
            <div className="flex flex-col gap-2.5 text-sm">
              <Link
                to="/customers"
                className="font-medium hover:underline"
                style={{ color: "var(--text-primary)" }}
              >
                {order.customer.name}
              </Link>
              <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                <Mail size={13} /> {order.customer.email}
              </div>
              <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                <Phone size={13} /> {order.customer.phone}
              </div>
              <div className="flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                <MapPin size={13} className="mt-0.5 shrink-0" /> {order.customer.address}
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Customer #{order.customerId}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
