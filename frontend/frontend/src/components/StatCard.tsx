import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon,
  accent = "violet",
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: "violet" | "blue" | "success" | "warning";
}) {
  const colorVar =
    accent === "blue"
      ? "var(--accent-blue)"
      : accent === "success"
        ? "var(--success)"
        : accent === "warning"
          ? "var(--warning)"
          : "var(--accent-violet)";

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-5"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div
        className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-[0.12]"
        style={{ background: colorVar, filter: "blur(20px)" }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            {label}
          </p>
          <p
            className="mt-2 font-mono text-3xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {value}
          </p>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `color-mix(in srgb, ${colorVar} 15%, transparent)`, color: colorVar }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
