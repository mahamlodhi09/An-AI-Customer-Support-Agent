import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const fieldBase =
  "w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:opacity-50";

const fieldStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
};

function Label({ children }: { children: ReactNode }) {
  return (
    <label
      className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
      style={{ color: "var(--text-secondary)" }}
    >
      {children}
    </label>
  );
}

interface WrapperProps {
  label: string;
  error?: string;
  children: ReactNode;
}

function FieldWrapper({ label, error, children }: WrapperProps) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {error && (
        <p className="mt-1 text-xs" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({
  label,
  error,
  className = "",
  ...rest
}: { label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldWrapper label={label} error={error}>
      <input
        className={`${fieldBase} ${className}`}
        style={{
          ...fieldStyle,
          borderColor: error ? "var(--danger)" : "var(--border)",
        }}
        {...rest}
      />
    </FieldWrapper>
  );
}

export function TextAreaField({
  label,
  error,
  className = "",
  ...rest
}: { label: string; error?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldWrapper label={label} error={error}>
      <textarea
        className={`${fieldBase} resize-none ${className}`}
        style={{
          ...fieldStyle,
          borderColor: error ? "var(--danger)" : "var(--border)",
        }}
        {...rest}
      />
    </FieldWrapper>
  );
}

export function SelectField({
  label,
  error,
  className = "",
  children,
  ...rest
}: { label: string; error?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldWrapper label={label} error={error}>
      <select
        className={`${fieldBase} ${className}`}
        style={fieldStyle}
        {...rest}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
