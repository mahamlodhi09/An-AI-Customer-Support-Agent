import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { supportTicketsApi, type CreateTicketInput } from "../api/supportTickets";
import { customersApi } from "../api/customers";
import { ordersApi } from "../api/orders";
import type { Customer, Order, SupportTicket, TicketStatus } from "../api/types";
import { PageHeader, LoadingState, EmptyState, ErrorState } from "../components/PageState";
import { TableShell, Th, Td, Tr } from "../components/Table";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { SelectField, TextAreaField } from "../components/Field";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../api/client";

const EMPTY_FORM: CreateTicketInput = { customerId: 0, message: "" };
const STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function SupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[] | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateTicketInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = () => {
    supportTicketsApi
      .list()
      .then((data) =>
        setTickets(
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
    ordersApi.list().then(setOrders).catch(() => {});
  }, []);

  // Arrived here from an order detail page's "Open a ticket" button
  useEffect(() => {
    const state = location.state as { orderId?: number; customerId?: number } | null;
    if (state?.customerId) {
      setForm({ customerId: state.customerId, orderId: state.orderId, message: "" });
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
    if (!form.customerId) {
      setFormError("Choose a customer.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const ticket = await supportTicketsApi.create(form);
      notify("success", `Ticket #${ticket.id} opened.`);
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (ticket: SupportTicket, status: TicketStatus) => {
    setUpdatingId(ticket.id);
    try {
      await supportTicketsApi.update(ticket.id, { status });
      notify("success", `Ticket #${ticket.id} marked ${status.toLowerCase().replace("_", " ")}.`);
      load();
    } catch (err) {
      notify("error", err instanceof ApiError ? err.message : "Update failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (error) return <ErrorState message={error} />;
  if (!tickets) return <LoadingState label="Loading support tickets" />;

  return (
    <div>
      <PageHeader
        title="Support tickets"
        subtitle={`${tickets.length} ticket${tickets.length === 1 ? "" : "s"} logged.`}
        action={
          <Button variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
            New ticket
          </Button>
        }
      />

      {tickets.length === 0 ? (
        <EmptyState
          title="No support tickets"
          description="Open a ticket to track a customer escalation."
          action={
            <Button variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
              New ticket
            </Button>
          }
        />
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>Ticket</Th>
              <Th>Customer</Th>
              <Th>Order</Th>
              <Th>Message</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <Tr key={t.id}>
                <Td mono className="text-[var(--text-muted)]">
                  #{t.id}
                </Td>
                <Td>{t.customer?.name ?? `Customer #${t.customerId}`}</Td>
                <Td mono className="text-[var(--text-muted)]">
                  {t.orderId ? `#${t.orderId}` : "—"}
                </Td>
                <Td className="max-w-xs">
                  <span className="truncate block" style={{ color: "var(--text-secondary)" }}>
                    {t.message}
                  </span>
                </Td>
                <Td>
                  <select
                    value={t.status}
                    disabled={updatingId === t.id}
                    onChange={(e) => changeStatus(t, e.target.value as TicketStatus)}
                    className="rounded-lg border-none py-1 pl-1 pr-6 text-xs font-medium outline-none"
                    style={{
                      background: "transparent",
                      color: "var(--text-primary)",
                    }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableShell>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New support ticket"
        description="Link an order if this is about a specific purchase, or leave it blank for a general question."
      >
        <form onSubmit={submit} className="flex flex-col gap-4">
          <SelectField
            label="Customer"
            required
            value={form.customerId || ""}
            onChange={(e) => setForm({ ...form, customerId: Number(e.target.value) })}
          >
            <option value="">Select a customer&hellip;</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} &mdash; {c.email}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Related order (optional)"
            value={form.orderId ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                orderId: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          >
            <option value="">No specific order</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                #{o.id} &mdash; {o.customer?.name ?? `Customer #${o.customerId}`}
              </option>
            ))}
          </SelectField>
          <TextAreaField
            label="Message"
            rows={4}
            required
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
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
              Open ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
