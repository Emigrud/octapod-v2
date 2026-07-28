import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sparkline } from "./Sparkline";

export type KpiTile = "blue" | "teal" | "orange" | "green" | "violet" | "neutral";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  delta?: { direction: "up" | "down" | "flat"; text: string };
  icon?: ReactNode;
  spark?: number[];
  tile?: KpiTile;
  trailing?: ReactNode;
  className?: string;
}

const TILE_CLASSES: Record<KpiTile, string> = {
  blue: "bg-tile-blue text-tile-blue-fg",
  teal: "bg-tile-teal text-tile-teal-fg",
  orange: "bg-tile-orange text-tile-orange-fg",
  green: "bg-tile-green text-tile-green-fg",
  violet: "bg-tile-violet text-tile-violet-fg",
  neutral: "bg-surface-2 text-muted-foreground",
};

export function KpiCard({
  label,
  value,
  delta,
  icon,
  spark,
  tile = "blue",
  trailing,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-hairline bg-surface-1 p-4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
              TILE_CLASSES[tile],
            )}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[11.5px] font-medium text-muted-foreground">{label}</div>
          <div className="mt-1 font-mono text-[28px] font-semibold leading-none text-foreground tabular">
            {value}
          </div>
          {delta && (
            <div
              className={cn(
                "mt-2 flex items-center gap-1 text-[11px]",
                delta.direction === "up" && "text-success",
                delta.direction === "down" && "text-danger",
                delta.direction === "flat" && "text-subtle-foreground",
              )}
            >
              <span className="font-mono">
                {delta.direction === "up" ? "↑" : delta.direction === "down" ? "↓" : "·"}
              </span>
              <span className="text-muted-foreground">{delta.text}</span>
            </div>
          )}
        </div>
      </div>
      {(spark || trailing) && (
        <div className="pointer-events-none absolute bottom-3 right-3 opacity-95">
          {trailing ?? (spark && <Sparkline points={spark} stroke="var(--accent-primary)" />)}
        </div>
      )}
    </div>
  );
}
