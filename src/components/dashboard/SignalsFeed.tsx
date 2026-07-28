import { ArrowRight, Zap, Database, Wind, Building2, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tag } from "@/components/octapod";

const SIGNALS = [
  {
    icon: Zap,
    title: "Fingrid 400 kV Line Upgrade (Oulu–Raahe)",
    meta: "Finland · Power Grid · 1–3 months out",
    time: "24m ago",
    impact: "High Impact",
    isNew: true,
  },
  {
    icon: Database,
    title: "Kainuu Data Center Power Demand",
    meta: "Finland · Data Center · 1–6 months out",
    time: "1h ago",
    impact: "High Impact",
    isNew: false,
  },
  {
    icon: Wind,
    title: "Baltic Sea Offshore Wind EIA Progress",
    meta: "Baltic Sea · Wind · 6–18 months out",
    time: "2h ago",
    impact: "Medium Impact",
    isNew: false,
  },
  {
    icon: Building2,
    title: "Lahti Substation Expansion Plan",
    meta: "Finland · Power Grid · 6–12 months out",
    time: "3h ago",
    impact: "Medium Impact",
    isNew: false,
  },
  {
    icon: Sun,
    title: "Solar Park 150 MW (Central Finland)",
    meta: "Finland · Solar · 3–9 months out",
    time: "5h ago",
    impact: "High Impact",
    isNew: false,
  },
];

const FILTERS = [
  { label: "All", count: 24, active: true },
  { label: "Power Grid", count: 9, active: false },
  { label: "Wind", count: 7, active: false },
];

export function SignalsFeed() {
  return (
    <section className="flex h-full flex-col rounded-md border border-hairline bg-surface-1/60">
      <header className="flex items-center justify-between px-4 py-3 hairline-b">
        <div className="font-display text-[14px] font-medium text-foreground">
          Early signals feed
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-signal hover:opacity-80"
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
              "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[11px] transition-colors",
              f.active
                ? "border-signal/50 bg-signal-muted text-signal"
                : "border-hairline bg-surface-2/40 text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
            <span className="font-mono text-[10px] tabular text-subtle-foreground">
              ({f.count})
            </span>
          </button>
        ))}
        <button
          type="button"
          className="ml-auto text-[11px] text-muted-foreground hover:text-foreground"
        >
          More ▾
        </button>
      </div>

      <ul className="flex-1 divide-y divide-hairline overflow-y-auto">
        {SIGNALS.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.title} className="flex items-start gap-3 px-4 py-3 hover:bg-surface-2/40">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-hairline bg-signal-muted text-signal">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
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
                <div className="mt-0.5 font-mono text-[10.5px] tracking-[0.04em] text-subtle-foreground">
                  {s.meta}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10.5px] text-muted-foreground">
                  <span>{s.time}</span>
                  <span className="text-hairline">·</span>
                  <span>{s.impact}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <footer className="hairline-t px-4 py-3">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-signal hover:opacity-80"
        >
          Go to Early Signals
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </footer>
    </section>
  );
}
