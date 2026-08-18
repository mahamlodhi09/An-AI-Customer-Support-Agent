import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, Plus, X } from "lucide-react";
import { refundsApi, type CreateRefundInput } from "../api/refunds";
import { ordersApi } from "../api/orders";
import type { Order, Refund } from "../api/types";
import { PageHeader, LoadingState, EmptyState, ErrorState } from "../components/PageState";
import { TableShell, Th, Td, Tr, IconButton } from "../components/Table";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { SelectField, TextAreaField, TextField } from "../components/Field";
import { StatusBadge } from "../components/Badge";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../api/client";

const EMPTY_FORM: CreateRefundInput = { orderId: 0, amount: 0, reason: "" };

export default function Refunds() {
  const [refunds, setRefunds] = useState<Refund[] | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateRefundInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);

  const load = () => {
    refundsApi
      .list()
      .then((data) =>
        setRefunds(
          [...data].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        ),
      )
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
    ordersApi.list().then(setOrders).catch(() => {});
  }, []);

  // Arrived here from an order detail page's "File a refund" button
  useEffect(() => {
    const state = location.state as { orderId?: number } | null;
    if (state?.orderId) {
      setForm({ ...EMPTY_FORM, orderId: state.orderId });
      setModalOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.orderId) {
      setFormError("Choose an order.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const refund = await refundsApi.create(form);
      notify("success", `Refund #${refund.id} filed.`);
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (refund: Refund, status: "APPROVED" | "REJECTED") => {
    setActingId(refund.id);
    try {
      await refundsApi.update(refund.id, { status });
      notify("success", `Refund #${refund.id} ${status.toLowerCase()}.`);
      load();
    } catch (err) {
      notify("error", err instanceof ApiError ? err.message : "Update failed.");
    } finally {
      setActingId(null);
    }
  };

  if (error) return <ErrorState message={error} />;
  if (!refunds) return <LoadingState label="Loading refunds" />;

  return (
    <div>
      <PageHeader
        title="Refunds"
        subtitle={`${refunds.length} refund${refunds.length === 1 ? "" : "s"} on file.`}
        action={
          <Button variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
            File refund
          </Button>
        }
      />

      {refunds.length === 0 ? (
        <EmptyState
          title="No refunds yet"
          description="File a refund against an order when a customer requests one."
          action={
            <Button variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
              File refund
            </Button>
          }
        />
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>Refund</Th>
              <Th>Order</Th>
              <Th>Reason</Th>
              <Th className="text-right">Amount</Th>
              <Th>Status</Th>
              <Th className="w-24" />
            </tr>
          </thead>
          <tbody>
            {refunds.map((r) => (
              <Tr key={r.id}>
                <Td mono className="text-[var(--text-muted)]">
                  #{r.id}
                </Td>
                <Td mono>#{r.orderId}</Td>
                <Td className="max-w-xs">
                  <span className="truncate block" style={{ color: "var(--text-secondary)" }}>
                    {r.reason}
                  </span>
                </Td>
                <Td className="text-right" mono>
                  ${r.amount.toFixed(2)}
                </Td>
                <Td>
                  <StatusBadge status={r.status} />
                </Td>
                <Td>
                  {r.status === "PENDING" && (
                    <div className="flex items-center justify-end gap-1">
                      <IconButton
                        label="Approve"
                        onClick={() => setStatus(r, "APPROVED")}
                      >
                        <Check
                          size={15}
                          style={{
                            color: actingId === r.id ? "var(--text-muted)" : "var(--success)",
                          }}
                        />
                      </IconButton>
                      <IconButton
                        label="Reject"
                        danger
                        onClick={() => setStatus(r, "REJECTED")}
                      >
                        <X size={15} />
                      </IconButton>
                    </div>
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableShell>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="File a refund"
        description="Refunds are always filed as pending, ready for review."
      >
        <form onSubmit={submit} className="flex flex-col gap-4">
          <SelectField
            label="Order"
            required
            value={form.orderId || ""}
            onChange={(e) => setForm({ ...form, orderId: Number(e.target.value) })}
          >
            <option value="">Select an order&hellip;</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                #{o.id} &mdash; {o.customer?.name ?? `Customer #${o.customerId}`}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Amount"
            type="number"
            step="0.01"
            min={0}
            required
            value={form.amount || ""}
            onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
          />
          <TextAreaField
            label="Reason"
            rows={3}
            required
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
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
              File refund
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
