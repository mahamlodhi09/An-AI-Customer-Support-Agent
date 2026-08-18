import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title="" width={400}>
      <div className="flex flex-col items-center text-center gap-3 -mt-2">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{ background: "var(--danger-bg)" }}
        >
          <AlertTriangle size={20} style={{ color: "var(--danger)" }} />
        </div>
        <h3
          className="text-base font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h3>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
        <div className="mt-3 flex w-full gap-2">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
