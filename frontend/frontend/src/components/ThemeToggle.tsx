import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle color theme"
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="relative flex h-9 w-[60px] shrink-0 items-center rounded-full border transition-colors"
      style={{ borderColor: "var(--border)", background: "var(--bg-elevated)" }}
    >
      <Moon
        size={13}
        className="absolute left-2"
        style={{ color: isDark ? "transparent" : "var(--text-muted)" }}
      />
      <Sun
        size={13}
        className="absolute right-2"
        style={{ color: isDark ? "var(--text-muted)" : "transparent" }}
      />
      <span
        className="absolute top-1 flex h-7 w-7 items-center justify-center rounded-full text-white transition-all duration-200"
        style={{
          backgroundImage: "var(--accent-gradient)",
          left: isDark ? "4px" : "27px",
        }}
      >
        {isDark ? <Moon size={13} /> : <Sun size={13} />}
      </span>
    </button>
  );
}
