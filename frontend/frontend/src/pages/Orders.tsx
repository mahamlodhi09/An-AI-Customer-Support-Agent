import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { ordersApi } from "../api/orders";
import { customersApi } from "../api/customers";
import { productsApi } from "../api/products";
import type { Customer, Order, Product } from "../api/types";
import { PageHeader, LoadingState, EmptyState, ErrorState } from "../components/PageState";
import { TableShell, Th, Td, Tr } from "../components/Table";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { SelectField } from "../components/Field";
import { StatusBadge } from "../components/Badge";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../api/client";

interface DraftLine {
  productId: number | "";
  quantity: number;
}

function orderTotal(order: Order, productMap: Map<number, Product>) {
  return order.items.reduce((sum, item) => {
    const price = item.product?.price ?? productMap.get(item.productId)?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState<number | "">("");
  const [lines, setLines] = useState<DraftLine[]>([{ productId: "", quantity: 1 }]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = () => {
    ordersApi
      .list()
      .then((data) =>
        setOrders(
          [...data].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        ),
      )
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
    customersApi.list().then(setCustomers).catch(() => {});
    productsApi.list().then(setProducts).catch(() => {});
  }, []);

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  const openCreate = () => {
    setCustomerId("");
    setLines([{ productId: "", quantity: 1 }]);
    setFormError(null);
    setModalOpen(true);
  };

  const updateLine = (index: number, patch: Partial<DraftLine>) => {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  const addLine = () => setLines((prev) => [...prev, { productId: "", quantity: 1 }]);
  const removeLine = (index: number) =>
    setLines((prev) => prev.filter((_, i) => i !== index));

  const draftTotal = lines.reduce((sum, l) => {
    if (l.productId === "") return sum;
    const p = productMap.get(l.productId);
    return sum + (p ? p.price * l.quantity : 0);
  }, 0);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (customerId === "") {
      setFormError("Choose a customer.");
      return;
    }
    const items = lines.filter((l) => l.productId !== "");
    if (items.length === 0) {
      setFormError("Add at least one product.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const order = await ordersApi.create({
        customerId,
        items: items.map((l) => ({
          productId: l.productId as number,
          quantity: l.quantity,
        })),
      });
      notify("success", `Order #${order.id} created.`);
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (error) return <ErrorState message={error} />;
  if (!orders) return <LoadingState label="Loading orders" />;

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} order${orders.length === 1 ? "" : "s"} placed.`}
        action={
          <Button variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
            New order
          </Button>
        }
      />

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Create an order by picking a customer and some products."
          action={
            <Button variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
              New order
            </Button>
          }
        />
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th>Items</Th>
              <Th>Status</Th>
              <Th className="text-right">Total</Th>
              <Th>Placed</Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <Tr key={o.id}>
                <Td>
                  <Link
                    to={`/orders/${o.id}`}
                    className="font-mono text-[13px] font-medium"
                    style={{ color: "var(--accent-violet)" }}
                  >
                    #{o.id}
                  </Link>
                </Td>
                <Td>{o.customer?.name ?? `Customer #${o.customerId}`}</Td>
                <Td>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {o.items.length} item{o.items.length === 1 ? "" : "s"}
                  </span>
                </Td>
                <Td>
                  <StatusBadge status={o.status} />
                </Td>
                <Td className="text-right" mono>
                  ${orderTotal(o, productMap).toFixed(2)}
                </Td>
                <Td>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(o.createdAt).toLocaleDateString()}
                  </span>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableShell>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New order"
        description="Pick a customer and add the products they're ordering."
        width={560}
      >
        <form onSubmit={submit} className="flex flex-col gap-4">
          <SelectField
            label="Customer"
            required
            value={customerId}
            onChange={(e) =>
              setCustomerId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">Select a customer&hellip;</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} &mdash; {c.email}
              </option>
            ))}
          </SelectField>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                className="block text-xs font-medium uppercase tracking-wide"
                style={{ color: "var(--text-secondary)" }}
              >
                Items
              </label>
              <button
                type="button"
                onClick={addLine}
                className="text-xs font-medium"
                style={{ color: "var(--accent-violet)" }}
              >
                + Add product
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {lines.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    className="min-w-0 flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    value={line.productId}
                    onChange={(e) =>
                      updateLine(i, {
                        productId: e.target.value ? Number(e.target.value) : "",
                      })
                    }
                  >
                    <option value="">Choose product&hellip;</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} (${p.price.toFixed(2)})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(i, { quantity: parseInt(e.target.value) || 1 })
                    }
                    className="w-16 rounded-lg px-2 py-2 text-center text-sm outline-none"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    disabled={lines.length === 1}
                    className="shrink-0 rounded-lg p-2 disabled:opacity-30"
                    style={{ color: "var(--danger)" }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div
            className="flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm"
            style={{ background: "var(--surface-hover)" }}
          >
            <span style={{ color: "var(--text-secondary)" }}>Estimated total</span>
            <span className="font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
              ${draftTotal.toFixed(2)}
            </span>
          </div>

          {formError && (
            <p className="text-sm" style={{ color: "var(--danger)" }}>
              {formError}
            </p>
          )}

          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Create order
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
