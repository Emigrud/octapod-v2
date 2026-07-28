import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    score: 92,
    title: "Fingrid – 400 kV Line Upgrade (Oulu–Raahe)",
    meta: "Power Grid · Finland · €120M–160M",
    status: "EIA Started",
    deadline: "Deadline 24 Jun",
  },
  {
    score: 88,
    title: "Solar Park 150 MW (Central Finland)",
    meta: "Solar · Finland · €80M–110M",
    status: "Land Use Planning",
    deadline: "Deadline 9 May",
  },
  {
    score: 85,
    title: "Wind Farm 120 MW (Pohjanmaa)",
    meta: "Wind · Finland · €95M–140M",
    status: "Grid Connection",
    deadline: "Deadline 21 May",
  },
];

export function TopOpportunities() {
  return (
    <section className="flex h-full flex-col rounded-md border border-hairline bg-surface-1/60">
      <header className="flex items-center justify-between px-4 py-3 hairline-b">
        <div className="font-display text-[14px] font-medium text-foreground">
          Top opportunities for you
        </div>
        <button
          type="button"
          className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-tender hover:opacity-80"
        >
          View all
        </button>
      </header>

      <ul className="flex-1 divide-y divide-hairline">
        {ITEMS.map((i) => (
          <li key={i.title} className="flex items-center gap-3 px-4 py-3">
            <FitScore value={i.score} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12.5px] font-medium text-foreground">{i.title}</div>
              <div className="mt-0.5 font-mono text-[10.5px] tracking-[0.04em] text-subtle-foreground">
                {i.meta}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-medium text-tender">{i.status}</div>
              <div className="mt-0.5 font-mono text-[10.5px] text-subtle-foreground">
                {i.deadline}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <footer className="hairline-t px-4 py-3">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-tender hover:opacity-80"
        >
          Explore all opportunities
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </footer>
    </section>
  );
}

function FitScore({ value }: { value: number }) {
  const tone =
    value >= 90 ? "border-tender/60 bg-tender-muted text-tender" : "border-hairline bg-surface-2/70 text-foreground";
  return (
    <span
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border font-mono text-[15px] font-semibold tabular",
        tone,
      )}
      title={`Fit score ${value}`}
    >
      {value}
    </span>
  );
}
