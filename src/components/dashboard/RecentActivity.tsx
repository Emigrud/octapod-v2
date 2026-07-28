import { Radio, FileText, Activity, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    icon: Radio,
    tile: "bg-tile-blue text-tile-blue-fg",
    title: "New early signal detected",
    meta: "Fingrid 400 kV Line Upgrade (Oulu–Raahe)",
    time: "24m ago",
  },
  {
    icon: FileText,
    tile: "bg-tile-orange text-tile-orange-fg",
    title: "Tender published",
    meta: "HVAC Systems for Data Center, Kajaani",
    time: "1h ago",
  },
  {
    icon: Activity,
    tile: "bg-tile-green text-tile-green-fg",
    title: "Project stage updated",
    meta: "Solar Park 150 MW (Central Finland)",
    time: "3h ago",
  },
  {
    icon: Sparkles,
    tile: "bg-tile-violet text-tile-violet-fg",
    title: "New EU funding opportunity",
    meta: "CEF Energy – Cross-border projects",
    time: "5h ago",
  },
];

export function RecentActivity() {
  return (
    <section className="flex h-full flex-col rounded-md border border-hairline bg-surface-1">
      <header className="flex items-center justify-between px-4 py-3 hairline-b">
        <div className="font-display text-[14px] font-semibold text-foreground">Recent Activity</div>
        <button className="text-[12px] font-medium text-primary hover:opacity-80">View all</button>
      </header>

      <ul className="flex-1 divide-y divide-hairline">
        {ITEMS.map((i) => {
          const Icon = i.icon;
          return (
            <li key={i.title} className="flex items-start gap-3 px-4 py-3">
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", i.tile)}>
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-medium text-foreground">{i.title}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{i.meta}</div>
              </div>
              <div className="font-mono text-[10.5px] text-subtle-foreground">{i.time}</div>
            </li>
          );
        })}
      </ul>

      <footer className="hairline-t px-4 py-3 text-[10.5px] text-subtle-foreground">
        All data is sourced from official public registries and publications.
      </footer>
    </section>
  );
}
