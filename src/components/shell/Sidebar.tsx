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
  Database,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/oktapod-logo-transparent.png.asset.json";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
}

const PRIMARY_NAV: NavItem[] = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/signals", label: "Early Signals", icon: Radio },
  { to: "/opportunities", label: "Tenders", icon: FileText },
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
  { to: "/ingestion", label: "Ingestion", icon: Database },
];


export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex md:w-[228px] shrink-0 flex-col hairline-r bg-surface-2/60">

      <nav className="flex-1 overflow-y-auto px-3 pt-3 pb-4">
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

        <div className="overflow-visible pt-8 pb-4">
          <img
            src={logoAsset.url}
            alt="oktapod"
            className="h-auto w-full scale-125 object-contain"
          />
        </div>
      </nav>


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
