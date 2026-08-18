import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { productsApi, type ProductInput } from "../api/products";
import type { Product } from "../api/types";
import { PageHeader, LoadingState, EmptyState, ErrorState } from "../components/PageState";
import { TableShell, Th, Td, Tr, IconButton } from "../components/Table";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { TextField, TextAreaField } from "../components/Field";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../api/client";

const EMPTY_FORM: ProductInput = {
  title: "",
  price: 0,
  category: "",
  description: "",
};

export default function Products() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { notify } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    productsApi
      .list()
      .then(setProducts)
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      title: product.title,
      price: product.price,
      category: product.category,
      description: product.description,
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
        await productsApi.update(editing.id, form);
        notify("success", `Updated "${form.title}".`);
      } else {
        await productsApi.create(form);
        notify("success", `Created "${form.title}".`);
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
      await productsApi.remove(deleteTarget.id);
      notify("success", `Deleted "${deleteTarget.title}".`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      notify("error", err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  if (error) return <ErrorState message={error} />;
  if (!products) return <LoadingState label="Loading products" />;

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} product${products.length === 1 ? "" : "s"} in your catalog.`}
        action={
          <Button variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
            New product
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
          placeholder="Search by title or category"
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
          title="No products found"
          description={
            search
              ? "Try a different search term."
              : "Create your first product to get started."
          }
          action={
            !search && (
              <Button variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
                New product
              </Button>
            )
          }
        />
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Category</Th>
              <Th className="text-right">Price</Th>
              <Th className="w-24" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <Tr key={p.id}>
                <Td className="max-w-xs">
                  <div className="truncate font-medium">{p.title}</div>
                  <div
                    className="truncate text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {p.description}
                  </div>
                </Td>
                <Td>
                  <span
                    className="rounded-md px-2 py-0.5 text-xs capitalize"
                    style={{ background: "var(--surface-hover)", color: "var(--text-secondary)" }}
                  >
                    {p.category}
                  </span>
                </Td>
                <Td className="text-right" mono>
                  ${p.price.toFixed(2)}
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <IconButton label="Edit" onClick={() => openEdit(p)}>
                      <Pencil size={15} />
                    </IconButton>
                    <IconButton
                      label="Delete"
                      danger
                      onClick={() => setDeleteTarget(p)}
                    >
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
        title={editing ? "Edit product" : "New product"}
        description={editing ? `Editing "${editing.title}"` : "Add a product to your catalog."}
      >
        <form onSubmit={submit} className="flex flex-col gap-4">
          <TextField
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Price"
              type="number"
              step="0.01"
              min={0}
              required
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: parseFloat(e.target.value) || 0 })
              }
            />
            <TextField
              label="Category"
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <TextAreaField
            label="Description"
            rows={3}
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {formError && (
            <p className="text-sm" style={{ color: "var(--danger)" }}>
              {formError}
            </p>
          )}
          <div className="mt-1 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editing ? "Save changes" : "Create product"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this product?"
        description={`"${deleteTarget?.title}" will be permanently removed. This can't be undone.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
