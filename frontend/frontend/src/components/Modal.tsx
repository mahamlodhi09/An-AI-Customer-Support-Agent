import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  width?: number;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  width = 480,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto p-4 pt-[8vh]">
      <div
        className="fixed inset-0"
        style={{ background: "rgba(8, 6, 18, 0.6)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full rounded-2xl border animate-[modal-in_0.16s_ease-out]"
        style={{
          maxWidth: width,
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div
          className="flex items-start justify-between gap-4 border-b px-6 py-4"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div>
            <h2
              id="modal-title"
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h2>
            {description && (
              <p
                className="mt-0.5 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 transition-colors hover:opacity-100"
            style={{ color: "var(--text-secondary)" }}
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
