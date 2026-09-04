import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type KpiTile = "blue" | "teal" | "orange" | "green" | "violet" | "neutral";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tile?: KpiTile;
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

export function KpiCard({ label, value, hint, icon, tile = "blue", className }: KpiCardProps) {
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
          {hint && <div className="mt-2 text-[11px] text-muted-foreground">{hint}</div>}
        </div>
      </div>
    </div>
  );
}
