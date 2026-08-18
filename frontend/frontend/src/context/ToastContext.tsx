import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

type ToastKind = "success" | "error";

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  notify: (kind: ToastKind, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);
let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (kind: ToastKind, message: string) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, kind, message }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-[min(360px,calc(100vw-2.5rem))]">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm animate-[toast-in_0.2s_ease-out]"
            style={{
              background: "var(--surface)",
              borderColor:
                t.kind === "success" ? "var(--success)" : "var(--danger)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            {t.kind === "success" ? (
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0"
                style={{ color: "var(--success)" }}
              />
            ) : (
              <XCircle
                size={18}
                className="mt-0.5 shrink-0"
                style={{ color: "var(--danger)" }}
              />
            )}
            <p
              className="text-sm leading-snug flex-1"
              style={{ color: "var(--text-primary)" }}
            >
              {t.message}
            </p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={15} style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside a ToastProvider");
  return ctx;
}
