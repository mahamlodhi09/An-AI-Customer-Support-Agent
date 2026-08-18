import type { ReactNode } from "react";

export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    </div>
  );
}

export function Th({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`whitespace-nowrap px-5 py-3 text-left text-xs font-medium uppercase tracking-wide ${className}`}
      style={{
        color: "var(--text-muted)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className = "",
  mono = false,
}: {
  children: ReactNode;
  className?: string;
  mono?: boolean;
}) {
  return (
    <td
      className={`whitespace-nowrap px-5 py-3.5 align-middle ${mono ? "font-mono text-[13px]" : ""} ${className}`}
      style={{ color: "var(--text-primary)" }}
    >
      {children}
    </td>
  );
}

export function Tr({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={onClick ? "cursor-pointer transition-colors" : ""}
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
      onMouseEnter={(e) => {
        if (onClick)
          e.currentTarget.style.backgroundColor = "var(--surface-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {children}
    </tr>
  );
}

export function IconButton({
  children,
  onClick,
  label,
  danger = false,
}: {
  children: ReactNode;
  onClick: (e: React.MouseEvent) => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
      style={{ color: danger ? "var(--danger)" : "var(--text-secondary)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = danger
          ? "var(--danger-bg)"
          : "var(--surface-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {children}
    </button>
  );
}
