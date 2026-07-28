import { ExternalLink, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Hotspot {
  cx: number;
  cy: number;
  count: number;
  label: string;
  intensity: "high" | "active" | "emerging";
}

const HOTSPOTS: Hotspot[] = [
  { cx: 220, cy: 130, count: 12, label: "Finland", intensity: "high" },
  { cx: 150, cy: 145, count: 9, label: "Sweden", intensity: "high" },
  { cx: 130, cy: 95, count: 8, label: "Norway", intensity: "active" },
  { cx: 115, cy: 200, count: 7, label: "Denmark", intensity: "active" },
  { cx: 210, cy: 215, count: 4, label: "Estonia / Latvia", intensity: "emerging" },
  { cx: 175, cy: 250, count: 5, label: "Poland", intensity: "active" },
];

export function MapPlaceholder() {
  return (
    <section className="flex h-full flex-col rounded-md border border-hairline bg-surface-1">
      <header className="flex items-center justify-between px-4 py-3 hairline-b">
        <div className="font-display text-[14px] font-semibold text-foreground">Market Overview</div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:opacity-80"
        >
          View map <ExternalLink className="h-3 w-3" />
        </button>
      </header>

      <div className="relative flex-1 overflow-hidden bg-surface-2/40">
        <div className="absolute inset-0 bg-isoline opacity-70" />
        <div className="absolute inset-0 bg-chart-grid opacity-40" />

        <svg
          viewBox="0 0 400 320"
          className="relative h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <g fill="var(--surface-3)" fillOpacity="0.9" stroke="var(--hairline)" strokeWidth="0.8">
            <path d="M110 40 L155 55 L170 90 L165 130 L175 170 L155 195 L140 205 L120 200 L110 175 L95 140 L100 100 Z" />
            <path d="M175 55 L230 65 L245 105 L240 150 L215 180 L190 165 L175 135 L170 95 Z" />
            <path d="M100 200 L130 195 L138 218 L115 228 L95 218 Z" />
            <path d="M185 195 L228 200 L235 232 L215 258 L180 260 L165 240 L172 215 Z" />
            <path d="M145 258 L210 262 L220 285 L165 292 L130 280 Z" />
          </g>

          {HOTSPOTS.map((h) => (
            <g key={h.label}>
              <circle cx={h.cx} cy={h.cy} r="22" fill="var(--accent-primary)" fillOpacity="0.10" />
              <circle
                cx={h.cx}
                cy={h.cy}
                r="14"
                fill={h.intensity === "high" ? "var(--accent-primary)" : "var(--accent-primary)"}
                fillOpacity={h.intensity === "high" ? 1 : h.intensity === "active" ? 0.85 : 0.55}
              />
              <text
                x={h.cx}
                y={h.cy + 4}
                textAnchor="middle"
                fill="white"
                fontFamily="var(--font-mono)"
                fontSize="11"
                fontWeight="600"
              >
                {h.count}
              </text>
              <text
                x={h.cx}
                y={h.cy - 22}
                textAnchor="middle"
                fill="var(--muted-foreground)"
                fontFamily="var(--font-sans)"
                fontSize="9.5"
              >
                {h.label}
              </text>
            </g>
          ))}
        </svg>

        <div className="absolute right-3 top-3 rounded border border-hairline bg-surface-1/80 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-subtle-foreground">
          Mapbox · pending
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 py-3 hairline-t">
        <div>
          <div className="mb-1.5 text-[11px] text-subtle-foreground">Filter by</div>
          <button
            type="button"
            className="inline-flex items-center justify-between gap-2 rounded-md border border-hairline bg-surface-1 px-3 py-1.5 text-[12px] text-foreground"
          >
            All sectors <ChevronDown className="h-3.5 w-3.5 text-subtle-foreground" />
          </button>
        </div>
        <div className="flex flex-col gap-1.5 text-[11px] text-muted-foreground">
          <LegendDot label="High activity (10+)" opacity={1} />
          <LegendDot label="Active (5–10)" opacity={0.75} />
          <LegendDot label="Emerging (1–4)" opacity={0.4} />
        </div>
        <div className="text-[10.5px] text-subtle-foreground">
          Data sources · 120+ public registries & publications
        </div>
      </div>
    </section>
  );
}

function LegendDot({ label, opacity }: { label: string; opacity: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn("h-2 w-2 rounded-full bg-primary")}
        style={{ opacity }}
      />
      {label}
    </span>
  );
}
