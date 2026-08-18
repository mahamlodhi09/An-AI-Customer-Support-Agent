import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { customersApi, type CustomerInput } from "../api/customers";
import type { Customer } from "../api/types";
import { PageHeader, LoadingState, EmptyState, ErrorState } from "../components/PageState";
import { TableShell, Th, Td, Tr, IconButton } from "../components/Table";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { TextField } from "../components/Field";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../api/client";

const EMPTY_FORM: CustomerInput = { name: "", email: "", phone: "", address: "" };

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { notify } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    customersApi
      .list()
      .then(setCustomers)
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await customersApi.update(editing.id, form);
        notify("success", `Updated "${form.name}".`);
      } else {
        await customersApi.create(form);
        notify("success", `Added "${form.name}".`);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await customersApi.remove(deleteTarget.id);
      notify("success", `Removed "${deleteTarget.name}".`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      notify("error", err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  if (error) return <ErrorState message={error} />;
  if (!customers) return <LoadingState label="Loading customers" />;

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} customer${customers.length === 1 ? "" : "s"} on record.`}
        action={
          <Button variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
            New customer
          </Button>
        }
      />

      <div className="mb-4 relative max-w-xs">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="w-full rounded-lg py-2 pl-9 pr-3 text-sm outline-none"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No customers found"
          description={search ? "Try a different search term." : "Add your first customer."}
          action={
            !search && (
              <Button variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
                New customer
              </Button>
            )
          }
        />
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Contact</Th>
              <Th>Address</Th>
              <Th className="w-24" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <Tr key={c.id}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundImage: "var(--accent-gradient)" }}
                    >
                      {initials(c.name)}
                    </div>
                    <span className="font-medium">{c.name}</span>
                  </div>
                </Td>
                <Td>
                  <div className="text-sm">{c.email}</div>
                  <div className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    {c.phone}
                  </div>
                </Td>
                <Td className="max-w-[220px]">
                  <span className="truncate block text-sm" style={{ color: "var(--text-secondary)" }}>
                    {c.address}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <IconButton label="Edit" onClick={() => openEdit(c)}>
                      <Pencil size={15} />
                    </IconButton>
                    <IconButton label="Delete" danger onClick={() => setDeleteTarget(c)}>
                      <Trash2 size={15} />
                    </IconButton>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableShell>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit customer" : "New customer"}
        description={editing ? `Editing "${editing.name}"` : "Add a customer record."}
      >
        <form onSubmit={submit} className="flex flex-col gap-4">
          <TextField
            label="Full name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            label="Phone"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <TextField
            label="Address"
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
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
              {editing ? "Save changes" : "Add customer"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove this customer?"
        description={`"${deleteTarget?.name}" will be permanently removed. This can't be undone.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
