import { Bell, Building2, ChevronDown, Search } from "lucide-react";

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 hairline-b bg-background/90 px-6 backdrop-blur-md">
      <div className="relative w-full max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground" />
        <input
          type="search"
          placeholder="Search projects, companies, tenders…"
          className="h-9 w-full rounded-md border border-hairline bg-surface-1 pl-9 pr-16 text-[13px] text-foreground placeholder:text-subtle-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-hairline bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-subtle-foreground">
          ⌘K
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-hairline bg-surface-1 px-3 py-1.5 text-[12.5px] text-foreground hover:border-primary/40"
        >
          <Building2 className="h-3.5 w-3.5 text-subtle-foreground" />
          <span>Demo Construction Oy</span>
          <ChevronDown className="h-3.5 w-3.5 text-subtle-foreground" />
        </button>

        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-surface-1 text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 font-mono text-[9.5px] font-semibold text-white">
            3
          </span>
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-md border border-hairline bg-surface-1 py-1 pl-1 pr-2 text-left hover:border-primary/40"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-mono text-[11px] font-semibold text-primary-foreground">
            JP
          </span>
          <span className="hidden text-[12px] leading-tight sm:block">
            <span className="block font-medium text-foreground">J. Parkkinen</span>
            <span className="block text-[10.5px] text-subtle-foreground">Analyst</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-subtle-foreground" />
        </button>
      </div>
    </header>
  );
}
