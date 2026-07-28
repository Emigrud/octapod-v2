import { Sparkles, ChevronRight, CheckCircle2, RefreshCw, Settings2, ArrowRight, Zap, Database, Wind, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

// TODO(phase 0B): the summary, key developments and recommended actions
// below are placeholder copy. They will be produced by the Claude API
// once the ingestion pipeline is connected.

const KEY_DEVELOPMENTS = [
  {
    icon: Zap,
    title: "Fingrid 400 kV line upgrade (Oulu–Raahe) published",
    meta: "€120M–160M · EIA started · Deadline 24 Jun",
  },
  {
    icon: Database,
    title: "Kajaani data center cluster drives new grid needs",
    meta: "HVAC systems & substations in high demand",
  },
  {
    icon: Wind,
    title: "Offshore wind EIA progress in the Baltic Sea",
    meta: "Several projects advancing to YVA phase",
  },
  {
    icon: Sun,
    title: "Solar & storage projects increase in Central Finland",
    meta: "3 new procurements published this week",
  },
];

const RECOMMENDED_ACTIONS = [
  "Prioritize proposals for 3 high-fit tenders closing in the next 30 days.",
  "Monitor Kainuu grid & substation projects for upcoming tenders.",
  "Track offshore wind EIA outcomes for early supplier positioning.",
];

export function BriefingCard() {
  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-md border border-tender/40 bg-tender-muted/40 ring-1 ring-tender/30 shadow-[var(--shadow-chart)]">
      <div className="pointer-events-none absolute inset-0 bg-isoline opacity-60" />

      <header className="relative flex items-center justify-between gap-3 px-5 py-4 hairline-b">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-tender/40 bg-tender/15 text-tender">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="font-display text-[16px] font-semibold text-foreground">
              AI situational awareness briefing
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle-foreground">
              Claude · continuous analyst
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
            Updated 09:15 UTC
          </span>
          <button
            type="button"
            aria-label="Refresh briefing"
            className="flex h-7 w-7 items-center justify-center rounded-sm border border-hairline bg-surface-1/60 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <div className="relative flex-1 space-y-5 px-5 py-4">
        <p className="text-[13.5px] leading-relaxed text-foreground/90">
          Strong Finnish energy-infrastructure activity continues, led by grid reinforcement in
          Southern Finland and power demand from data centers in Kainuu. Offshore wind EIA
          progress is accelerating in the Baltic Sea. Several high-fit tenders with approaching
          deadlines require attention.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <BriefingList title="Key developments">
            {KEY_DEVELOPMENTS.map((k) => {
              const Icon = k.icon;
              return (
                <li
                  key={k.title}
                  className="group flex items-start gap-3 rounded-sm border border-hairline bg-surface-1/70 p-3 hover:border-tender/40"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-hairline bg-tender-muted text-tender">
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-medium text-foreground">
                      {k.title}
                    </div>
                    <div className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-subtle-foreground">
                      {k.meta}
                    </div>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-subtle-foreground group-hover:text-tender" />
                </li>
              );
            })}
          </BriefingList>

          <BriefingList title="Recommended actions">
            {RECOMMENDED_ACTIONS.map((a) => (
              <li
                key={a}
                className="flex items-start gap-3 rounded-sm border border-hairline bg-surface-1/70 p-3"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-tender" strokeWidth={1.8} />
                <span className="text-[12.5px] leading-relaxed text-foreground/90">{a}</span>
              </li>
            ))}
          </BriefingList>
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-sm border border-hairline bg-surface-1/60 p-3">
          <BriefingMetric label="Risk" value="Medium" color="var(--accent-signal)" />
          <BriefingMetric label="Priority" value="High" color="var(--status-danger)" />
          <BriefingMetric label="Confidence" value="High" color="var(--status-success)" />
        </div>
      </div>

      <footer className="relative flex items-center justify-between gap-3 px-5 py-3 hairline-t">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-tender hover:opacity-80"
        >
          View full briefing & supporting signals
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-sm border border-hairline bg-surface-1/70 px-2.5 py-1 text-[11.5px] text-muted-foreground hover:text-foreground"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Briefing settings
        </button>
      </footer>
    </section>
  );
}

function BriefingList({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className={cn("text-eyebrow mb-2")}>{title}</div>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function BriefingMetric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-eyebrow">{label}</div>
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        <span className="text-[13px] font-medium text-foreground">{value}</span>
      </div>
    </div>
  );
}
