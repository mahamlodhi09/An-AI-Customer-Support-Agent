const STATUS_COLORS: Record<string, { fg: string; bg: string }> = {
  PENDING: { fg: "var(--warning)", bg: "var(--warning-bg)" },
  PROCESSING: { fg: "var(--info)", bg: "var(--info-bg)" },
  SHIPPED: { fg: "var(--accent-blue)", bg: "rgba(94,168,245,0.12)" },
  DELIVERED: { fg: "var(--success)", bg: "var(--success-bg)" },
  CANCELLED: { fg: "var(--danger)", bg: "var(--danger-bg)" },
  APPROVED: { fg: "var(--success)", bg: "var(--success-bg)" },
  REJECTED: { fg: "var(--danger)", bg: "var(--danger-bg)" },
  OPEN: { fg: "var(--info)", bg: "var(--info-bg)" },
  IN_PROGRESS: { fg: "var(--warning)", bg: "var(--warning-bg)" },
  RESOLVED: { fg: "var(--success)", bg: "var(--success-bg)" },
  CLOSED: { fg: "var(--neutral)", bg: "var(--neutral-bg)" },
};

export function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? {
    fg: "var(--text-secondary)",
    bg: "var(--neutral-bg)",
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium font-mono tracking-tight"
      style={{ color: c.fg, backgroundColor: c.bg }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: c.fg }}
      />
      {status.replace("_", " ")}
    </span>
  );
}
