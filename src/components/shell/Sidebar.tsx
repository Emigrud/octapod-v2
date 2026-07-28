import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FileText, Radio, Map, Settings2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  code: string;
}

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, code: "01" },
  { to: "/opportunities", label: "Opportunities", icon: FileText, code: "02" },
  { to: "/signals", label: "Signals", icon: Radio, code: "03" },
  { to: "/map", label: "Map", icon: Map, code: "04" },
  { to: "/settings", label: "Settings", icon: Settings2, code: "05" },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex md:w-[232px] shrink-0 flex-col hairline-r bg-surface-1/40">
      <div className="flex h-14 items-center gap-2.5 px-5 hairline-b">
        <Logomark />
        <div className="flex flex-col leading-none">
          <span className="font-display text-[15px] font-semibold tracking-[0.02em] text-foreground">
            OCTAPOD
          </span>
          <span className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-subtle-foreground">
            Market intel · FI
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="text-eyebrow px-2 pb-2">Workspace</div>
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "group flex items-center gap-3 rounded-sm px-2.5 py-2 text-[13px] transition-colors",
                    active
                      ? "bg-surface-2 text-foreground"
                      : "text-muted-foreground hover:bg-surface-2/60 hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[10px] tabular tracking-[0.14em]",
                      active ? "text-tender" : "text-subtle-foreground",
                    )}
                  >
                    {item.code}
                  </span>
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.6} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {active && (
                    <span className="h-1 w-1 rounded-full bg-tender shadow-[0_0_10px_var(--accent-tender)]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mx-3 mb-3 rounded-sm border border-hairline bg-surface-2/40 p-3">
        <div className="text-eyebrow">Pilot status</div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-signal" />
          <span className="text-[12px] text-foreground">Phase 0 · Foundation</span>
        </div>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle-foreground">
          FI · pilot market
        </div>
      </div>
    </aside>
  );
}

function Logomark() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-7 w-7 text-tender"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden
    >
      <circle cx="16" cy="16" r="13" />
      <circle cx="16" cy="16" r="8" />
      <circle cx="16" cy="16" r="2.2" fill="currentColor" stroke="none" />
      <path d="M16 3v6M16 23v6M3 16h6M23 16h6M6.7 6.7l4.2 4.2M21.1 21.1l4.2 4.2M25.3 6.7l-4.2 4.2M10.9 21.1l-4.2 4.2" />
    </svg>
  );
}
