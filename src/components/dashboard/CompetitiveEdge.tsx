import { ArrowRight } from "lucide-react";

function DualLineChart() {
  const you = [8, 14, 12, 18, 24, 22, 28, 30, 34, 32, 38, 42];
  const market = [10, 12, 11, 14, 13, 16, 15, 17, 16, 18, 17, 19];
  const w = 260;
  const h = 70;
  const max = Math.max(...you, ...market);
  const min = Math.min(...you, ...market);
  const range = max - min || 1;
  const toPath = (points: number[]) => {
    const step = w / (points.length - 1);
    return points
      .map((p, i) => {
        const x = i * step;
        const y = h - ((p - min) / range) * (h - 6) - 3;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" aria-hidden>
      <path d={toPath(market)} fill="none" stroke="var(--subtle-foreground)" strokeWidth="1.2" strokeDasharray="3 3" />
      <path d={toPath(you)} fill="none" stroke="var(--accent-primary)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function CompetitiveEdge() {
  return (
    <section className="flex h-full flex-col rounded-md border border-hairline bg-surface-1">
      <header className="flex items-center justify-between px-4 py-3 hairline-b">
        <div className="font-display text-[14px] font-semibold text-foreground">
          Your Competitive Edge
        </div>
      </header>

      <div className="flex-1 space-y-3 px-4 py-3">
        <div>
          <div className="font-mono text-[38px] font-semibold leading-none text-primary tabular">
            412 <span className="text-[16px] font-medium text-foreground/80">days</span>
          </div>
          <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
            Average lead start on projects before tender publication vs market average: 61 days.
          </p>
        </div>

        <div className="rounded-md border border-hairline bg-surface-2/40 p-3">
          <DualLineChart />
          <div className="mt-2 flex items-center gap-3 text-[10.5px] text-subtle-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="h-0.5 w-3 bg-primary" /> You
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-0.5 w-3 bg-subtle-foreground/70" /> Market avg.
            </span>
          </div>
        </div>

        <button className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-primary hover:opacity-80">
          How we calculate this <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}
