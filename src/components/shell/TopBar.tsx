import { useEffect, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function TopBar() {
  const [utc, setUtc] = useState<string | null>(null);

  useEffect(() => {
    setUtc(formatUtc(new Date()));
    const id = window.setInterval(() => setUtc(formatUtc(new Date())), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 hairline-b bg-background/85 px-5 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          className="group inline-flex items-center gap-2 rounded-sm border border-hairline bg-surface-2/50 px-2.5 py-1.5 text-[12px] text-foreground transition-colors hover:border-border"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle-foreground">
            Org
          </span>
          <span className="text-muted-foreground">Organization —</span>
          <ChevronDown className="h-3.5 w-3.5 text-subtle-foreground" />
        </button>
      </div>

      <div className="relative hidden md:block flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle-foreground" />
        <input
          type="search"
          placeholder="Search tenders, signals, buyers, CPV…"
          className="h-8 w-full rounded-sm border border-hairline bg-surface-1/60 pl-8 pr-3 text-[12.5px] text-foreground placeholder:text-subtle-foreground focus:border-tender/50 focus:outline-none focus:ring-1 focus:ring-tender/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-subtle-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-success/80 shadow-[0_0_8px_var(--status-success)]" />
          <span>All sources idle</span>
          <span className="text-hairline">·</span>
          <span className="tabular text-muted-foreground min-w-[80px]">{utc ? `${utc} UTC` : "— UTC"}</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

function formatUtc(d: Date) {
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}
