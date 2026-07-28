import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountryChip } from "@/components/octapod";

interface Hotspot {
  cx: number;
  cy: number;
  count: number;
  label: string;
  intensity: "high" | "active" | "emerging";
}

// Illustrative — not geographically precise. Positions in viewBox 0..400 x 0..320.
const HOTSPOTS: Hotspot[] = [
  { cx: 210, cy: 130, count: 12, label: "Finland", intensity: "high" },
  { cx: 150, cy: 145, count: 9, label: "Sweden", intensity: "high" },
  { cx: 130, cy: 95, count: 8, label: "Norway", intensity: "active" },
  { cx: 118, cy: 195, count: 7, label: "Denmark", intensity: "active" },
  { cx: 205, cy: 210, count: 5, label: "Estonia / Latvia", intensity: "active" },
  { cx: 175, cy: 245, count: 4, label: "Lithuania", intensity: "emerging" },
];

export function MapPlaceholder() {
  return (
    <section className="flex h-full flex-col rounded-md border border-hairline bg-surface-1/60">
      <header className="flex items-center justify-between px-4 py-3 hairline-b">
        <div className="font-display text-[14px] font-medium text-foreground">Market overview</div>
        <button
          type="button"
          className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-tender hover:opacity-80"
        >
          View map <ExternalLink className="h-3 w-3" />
        </button>
      </header>

      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-isoline" />
        <div className="absolute inset-0 bg-chart-grid opacity-50" />

        <svg
          viewBox="0 0 400 320"
          className="relative h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          {/* Very rough Nordic + Baltic silhouette */}
          <g fill="var(--surface-2)" fillOpacity="0.55" stroke="var(--hairline)" strokeWidth="0.8">
            {/* Norway/Sweden peninsula */}
            <path d="M110 40 L155 55 L170 90 L165 130 L175 170 L155 195 L140 205 L120 200 L110 175 L95 140 L100 100 Z" />
            {/* Finland */}
            <path d="M175 55 L225 65 L235 100 L230 145 L210 175 L185 165 L175 135 L170 95 Z" />
            {/* Denmark */}
            <path d="M105 200 L130 195 L135 215 L115 225 L100 215 Z" />
            {/* Baltics */}
            <path d="M185 195 L225 200 L230 230 L215 255 L185 260 L165 245 L170 215 Z" />
            {/* Poland tip */}
            <path d="M150 260 L200 265 L215 285 L170 290 L135 280 Z" />
          </g>

          {/* Latitude/longitude reticles */}
          <g stroke="var(--hairline)" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.7">
            <line x1="0" y1="90" x2="400" y2="90" />
            <line x1="0" y1="180" x2="400" y2="180" />
            <line x1="130" y1="0" x2="130" y2="320" />
            <line x1="210" y1="0" x2="210" y2="320" />
          </g>

          {/* Hotspots */}
          {HOTSPOTS.map((h) => {
            const color =
              h.intensity === "high"
                ? "var(--accent-tender)"
                : h.intensity === "active"
                  ? "var(--accent-tender)"
                  : "var(--muted-foreground)";
            const opacity = h.intensity === "high" ? 1 : h.intensity === "active" ? 0.75 : 0.45;
            return (
              <g key={h.label} opacity={opacity}>
                <circle cx={h.cx} cy={h.cy} r="18" fill={color} fillOpacity="0.12" />
                <circle cx={h.cx} cy={h.cy} r="13" fill={color} fillOpacity="0.9" />
                <text
                  x={h.cx}
                  y={h.cy + 4}
                  textAnchor="middle"
                  fill="var(--background)"
                  fontFamily="var(--font-mono)"
                  fontSize="11"
                  fontWeight="600"
                >
                  {h.count}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-3 font-mono text-[9.5px] uppercase tracking-[0.18em] text-subtle-foreground">
          Mapbox · pending
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 py-3 hairline-t">
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <LegendDot label="High activity (10+)" className="bg-tender" />
          <LegendDot label="Active (5–10)" className="bg-tender/60" />
          <LegendDot label="Emerging (1–4)" className="bg-muted-foreground/60" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {["FIN", "SWE", "NOR", "DNK", "EST", "LVA", "LTU", "POL"].map((c) => (
            <CountryChip key={c} code={c} />
          ))}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle-foreground">
          Data sources · 120+ public registries and publications
        </div>
      </div>
    </section>
  );
}

function LegendDot({ label, className }: { label: string; className?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-1.5 w-1.5 rounded-full", className)} />
      {label}
    </span>
  );
}
