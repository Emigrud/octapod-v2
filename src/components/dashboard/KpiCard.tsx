import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sparkline } from "./Sparkline";

export type KpiVariant = "tender" | "signal" | "neutral";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  delta?: { direction: "up" | "down" | "flat"; text: string };
  icon?: ReactNode;
  spark?: number[];
  variant?: KpiVariant;
  trailing?: ReactNode;
  className?: string;
}

export function KpiCard({
  label,
  value,
  delta,
  icon,
  spark,
  variant = "tender",
  trailing,
  className,
}: KpiCardProps) {
  const accent =
    variant === "tender" ? "var(--accent-tender)" : variant === "signal" ? "var(--accent-signal)" : "var(--muted-foreground)";
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-hairline bg-surface-1/70 p-4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-hairline",
              variant === "tender" && "bg-tender-muted text-tender",
              variant === "signal" && "bg-signal-muted text-signal",
              variant === "neutral" && "bg-surface-2/60 text-muted-foreground",
            )}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-eyebrow truncate">{label}</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-mono text-[26px] font-medium leading-none text-foreground tabular">
              {value}
            </span>
          </div>
          {delta && (
            <div
              className={cn(
                "mt-2 flex items-center gap-1 font-mono text-[10.5px] tracking-[0.04em]",
                delta.direction === "up" && "text-tender",
                delta.direction === "down" && "text-danger",
                delta.direction === "flat" && "text-subtle-foreground",
              )}
            >
              <span>
                {delta.direction === "up" ? "↑" : delta.direction === "down" ? "↓" : "→"}
              </span>
              <span className="text-muted-foreground">{delta.text}</span>
            </div>
          )}
        </div>
      </div>
      {(spark || trailing) && (
        <div className="pointer-events-none absolute bottom-3 right-3 opacity-90">
          {trailing ?? (spark && <Sparkline points={spark} stroke={accent} />)}
        </div>
      )}
    </div>
  );
}
