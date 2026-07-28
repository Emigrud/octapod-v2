import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  accent?: "tender" | "signal" | "neutral";
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  eyebrow,
  title,
  description,
  icon,
  action,
  accent = "neutral",
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-md border border-hairline bg-surface-1/40 px-8 py-14 text-center",
        className,
      )}
    >
      {accent !== "neutral" && (
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 top-0 h-px",
            accent === "tender" && "bg-tender/60",
            accent === "signal" && "bg-signal/60",
          )}
        />
      )}
      {icon && (
        <div
          className={cn(
            "mb-5 flex h-12 w-12 items-center justify-center rounded-sm border border-hairline bg-surface-2/60",
            accent === "tender" && "text-tender",
            accent === "signal" && "text-signal",
            accent === "neutral" && "text-muted-foreground",
          )}
        >
          {icon}
        </div>
      )}
      {eyebrow && <div className="text-eyebrow mb-3">{eyebrow}</div>}
      <h2 className="font-display text-[22px] font-medium text-foreground">{title}</h2>
      {description && (
        <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
      {children && <div className="mt-8 w-full">{children}</div>}
    </div>
  );
}
