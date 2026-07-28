import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to chart paper mode" : "Switch to chart room mode"}
      title={isDark ? "Chart paper (light)" : "Chart room (dark)"}
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-sm border border-hairline bg-surface-2/40 px-2.5 text-[11px] font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground hover:border-border",
        className,
      )}
    >
      {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      <span className="font-mono uppercase tracking-[0.18em]">
        {isDark ? "Chart room" : "Chart paper"}
      </span>
    </button>
  );
}
