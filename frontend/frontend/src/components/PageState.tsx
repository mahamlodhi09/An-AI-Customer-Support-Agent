import type { ReactNode } from "react";
import { Loader2, Inbox, WifiOff } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <Loader2
        size={22}
        className="animate-[spin_0.8s_linear_infinite]"
        style={{ color: "var(--accent-violet)" }}
      />
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {label}&hellip;
      </p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-20 text-center"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "var(--surface-hover)" }}
      >
        <Inbox size={20} style={{ color: "var(--text-muted)" }} />
      </div>
      <div>
        <p className="font-medium" style={{ color: "var(--text-primary)" }}>
          {title}
        </p>
        {description && (
          <p
            className="mt-1 max-w-sm text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border py-20 text-center"
      style={{ borderColor: "var(--danger)", background: "var(--danger-bg)" }}
    >
      <WifiOff size={22} style={{ color: "var(--danger)" }} />
      <div>
        <p className="font-medium" style={{ color: "var(--text-primary)" }}>
          Couldn't load this page
        </p>
        <p
          className="mt-1 max-w-sm text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
