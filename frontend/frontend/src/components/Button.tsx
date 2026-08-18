import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = "secondary",
  loading = false,
  icon,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium px-4 py-2.5 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const styles: Record<Variant, string> = {
    primary: "text-white",
    secondary: "",
    ghost: "",
    danger: "text-white",
  };

  const variantStyle: React.CSSProperties =
    variant === "primary"
      ? { backgroundImage: "var(--accent-gradient)", boxShadow: "var(--accent-glow)" }
      : variant === "danger"
        ? { backgroundColor: "var(--danger)" }
        : variant === "secondary"
          ? {
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }
          : { color: "var(--text-secondary)" };

  return (
    <button
      className={`${base} ${styles[variant]} ${className}`}
      style={variantStyle}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <Loader2 size={15} className="animate-[spin_0.8s_linear_infinite]" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
