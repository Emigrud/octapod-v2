import { Tag } from "@/components/octapod";
import { Sparkline } from "./Sparkline";

export function MarketIntelligence() {
  return (
    <section className="flex h-full flex-col rounded-md border border-hairline bg-surface-1">
      <header className="flex items-center justify-between px-4 py-3 hairline-b">
        <div className="font-display text-[14px] font-semibold text-foreground">
          Market Intelligence
        </div>
        <button className="text-[12px] font-medium text-primary hover:opacity-80">
          View report
        </button>
      </header>

      <div className="flex-1 space-y-3 px-4 py-3">
        <div className="text-[13px] font-medium text-foreground">Power Grid Outlook 2025–2030</div>
        <p className="text-[11.5px] leading-relaxed text-muted-foreground">
          Transmission investments across Nordics & Baltics are expected to grow 28% YoY, driven
          by renewable integration and grid modernization.
        </p>
        <div className="rounded-md border border-hairline bg-surface-2/40 p-3">
          <Sparkline
            points={[8, 12, 10, 16, 14, 20, 22, 21, 26, 28, 32, 35]}
            width={220}
            height={54}
            stroke="var(--accent-primary)"
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between">
          <Tag variant="tender" size="sm">
            High confidence
          </Tag>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="h-1.5 w-1.5 rounded-full bg-hairline" />
            <span className="h-1.5 w-1.5 rounded-full bg-hairline" />
          </div>
        </div>
      </div>
    </section>
  );
}
