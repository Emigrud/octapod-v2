import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Radio,
  FileText,
  FolderKanban,
  Map,
  CalendarDays,
  Users,
  BarChart3,
  User,
  Building2,
  BellRing,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/oktapod-logo.png.asset.json";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
}

const PRIMARY_NAV: NavItem[] = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/signals", label: "Early Signals", icon: Radio, badge: 24 },
  { to: "/opportunities", label: "Tenders", icon: FileText, badge: 128 },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/map", label: "Map", icon: Map },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/competitors", label: "Competitors", icon: Users },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

const SETTINGS_NAV: NavItem[] = [
  { to: "/settings", label: "My Profile", icon: User },
  { to: "/settings/company", label: "Company Profile", icon: Building2 },
  { to: "/settings/alerts", label: "Alerts & Subscriptions", icon: BellRing },
];


export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex md:w-[228px] shrink-0 flex-col hairline-r bg-surface-2/60">
      <div className="flex h-16 items-center gap-2 px-5">
        <img src={logoAsset.url} alt="oktapod" className="h-8 w-8 object-contain" />
        <span className="font-display text-[20px] font-semibold text-primary lowercase tracking-tight">
          oktapod
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <ul className="space-y-0.5">
          {PRIMARY_NAV.map((item) => (
            <NavRow key={item.to} item={item} pathname={pathname} />
          ))}
        </ul>

        <div className="mt-6 px-2 pb-2 text-eyebrow">My settings</div>
        <ul className="space-y-0.5">
          {SETTINGS_NAV.map((item) => (
            <NavRow key={item.to} item={item} pathname={pathname} />
          ))}
        </ul>
      </nav>


      <div className="mx-3 mb-2 rounded-md border border-hairline bg-surface-1 p-3">
        <div className="text-eyebrow">System status</div>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          <span className="text-[11.5px] text-foreground">All systems operational</span>
        </div>
        <div className="mt-1 font-mono text-[10px] text-subtle-foreground">
          Last update · 2 min ago
        </div>
      </div>

      <button
        type="button"
        className="mx-3 mb-4 inline-flex items-center justify-between gap-2 rounded-md border border-hairline bg-surface-1 px-3 py-2 text-[12px] text-foreground hover:border-primary/40 hover:bg-primary-muted"
      >
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          What's new
        </span>
        <span className="text-subtle-foreground">›</span>
      </button>
    </aside>
  );
}

function NavRow({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
  const Icon = item.icon;
  return (
    <li>
      <Link
        to={item.to}
        className={cn(
          "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors",
          active
            ? "bg-primary-muted text-primary"
            : "text-muted-foreground hover:bg-surface-1 hover:text-foreground",
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-subtle-foreground")} strokeWidth={1.7} />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge !== undefined && (
          <span
            className={cn(
              "font-mono text-[10.5px] tabular",
              active ? "text-primary" : "text-subtle-foreground",
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  );
}
