import { Zap, Database, Wind, Building2, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tag } from "@/components/octapod";

const SIGNALS = [
  {
    icon: Zap,
    tile: "bg-tile-orange text-tile-orange-fg",
    title: "Fingrid 400 kV Line Upgrade (Oulu–Raahe)",
    meta: "Finland · Power Grid",
    time: "24m ago",
    impact: "High Impact",
    lead: "1–3 months out",
    isNew: true,
  },
  {
    icon: Database,
    tile: "bg-tile-blue text-tile-blue-fg",
    title: "Kainuu Data Center Power Demand",
    meta: "Finland · Data Center",
    time: "1h ago",
    impact: "High Impact",
    lead: "1–6 months out",
    isNew: false,
  },
  {
    icon: Wind,
    tile: "bg-tile-teal text-tile-teal-fg",
    title: "Baltic Sea Offshore Wind EIA Progress",
    meta: "Baltic Sea · Wind",
    time: "2h ago",
    impact: "Medium Impact",
    lead: "6–18 months out",
    isNew: false,
  },
  {
    icon: Building2,
    tile: "bg-tile-blue text-tile-blue-fg",
    title: "Lahti Substation Expansion Plan",
    meta: "Finland · Power Grid",
    time: "3h ago",
    impact: "Medium Impact",
    lead: "6–12 months out",
    isNew: false,
  },
  {
    icon: Sun,
    tile: "bg-tile-green text-tile-green-fg",
    title: "Solar Park 150 MW (Central Finland)",
    meta: "Finland · Solar",
    time: "5h ago",
    impact: "High Impact",
    lead: "3–9 months out",
    isNew: false,
  },
];

const FILTERS = [
  { label: "All", count: 24, active: true },
  { label: "Power Grid", count: 9 },
  { label: "Wind", count: 7 },
];

export function SignalsFeed() {
  return (
    <section className="flex h-full flex-col rounded-md border border-hairline bg-surface-1">
      <header className="flex items-center justify-between px-4 py-3 hairline-b">
        <div className="font-display text-[14px] font-semibold text-foreground">
          Early Signals Feed
        </div>
        <button
          type="button"
          className="text-[12px] font-medium text-primary hover:opacity-80"
        >
          View all
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-1.5 px-4 py-2.5 hairline-b">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            type="button"
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition-colors",
              f.active
                ? "bg-primary text-primary-foreground"
                : "border border-hairline bg-surface-1 text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label} <span className="font-mono tabular opacity-80">({f.count})</span>
          </button>
        ))}
        <button className="ml-auto text-[11px] text-muted-foreground hover:text-foreground">
          More ▾
        </button>
      </div>

      <ul className="flex-1 divide-y divide-hairline overflow-y-auto">
        {SIGNALS.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.title} className="flex items-start gap-3 px-4 py-3 hover:bg-surface-2/60">
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", s.tile)}>
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[12.5px] font-medium text-foreground">
                    {s.title}
                  </span>
                  {s.isNew && (
                    <Tag variant="signal" size="sm">
                      New
                    </Tag>
                  )}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{s.meta}</div>
                <div className="mt-1 flex items-center gap-2 text-[10.5px] text-subtle-foreground">
                  <span>{s.time}</span>
                  <span>·</span>
                  <span>{s.impact}</span>
                  <span>·</span>
                  <span>{s.lead}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <footer className="hairline-t px-4 py-3">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-primary hover:opacity-80"
        >
          Go to Early Signals →
        </button>
      </footer>
    </section>
  );
}
