import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatVariant = "tender" | "signal" | "neutral";
export type StatState = "ready" | "loading" | "empty" | "error";

interface StatCardProps {
  label: string;
  value?: ReactNode;
  unit?: string;
  delta?: ReactNode;
  hint?: ReactNode;
  variant?: StatVariant;
  state?: StatState;
  className?: string;
}

export function StatCard({
  label,
  value,
  unit,
  delta,
  hint,
  variant = "neutral",
  state = "ready",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-hairline bg-surface-1/60 p-4",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-0 h-full w-[2px]",
          variant === "tender" && "bg-tender",
          variant === "signal" && "bg-signal",
          variant === "neutral" && "bg-hairline",
        )}
      />
      <div className="flex items-center justify-between">
        <div className="text-eyebrow">{label}</div>
        {variant !== "neutral" && (
          <span
            className={cn(
              "font-mono text-[9.5px] uppercase tracking-[0.18em]",
              variant === "tender" && "text-tender",
              variant === "signal" && "text-signal",
            )}
          >
            {variant === "tender" ? "Tender" : "Signal"}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        {state === "loading" ? (
          <div className="h-8 w-24 animate-pulse rounded-sm bg-surface-3/70" />
        ) : state === "error" ? (
          <span className="font-mono text-[13px] text-danger">— error</span>
        ) : state === "empty" || value === undefined ? (
          <span className="font-mono text-[26px] leading-none text-subtle-foreground tabular">
            —
          </span>
        ) : (
          <>
            <span className="font-mono text-[26px] font-medium leading-none text-foreground tabular">
              {value}
            </span>
            {unit && (
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle-foreground">
                {unit}
              </span>
            )}
          </>
        )}
      </div>

      {(delta || hint) && (
        <div className="mt-2.5 flex items-center gap-2 text-[11.5px] text-muted-foreground">
          {delta}
          {hint && <span className="text-subtle-foreground">{hint}</span>}
        </div>
      )}
    </div>
  );
}
