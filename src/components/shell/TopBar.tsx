import { Building2, LogOut, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentOrg } from "@/hooks/use-org";
import { AUTH_ENABLED } from "@/lib/auth-flags";

export function TopBar() {
  const { data: org, isLoading, isError } = useCurrentOrg();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  const orgLabel = !AUTH_ENABLED
    ? "OCTAPOD — pilot preview"
    : isLoading
      ? "Loading…"
      : isError
        ? "Unavailable"
        : (org?.name ?? "No organization");

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
        <div className="inline-flex items-center gap-2 rounded-md border border-hairline bg-surface-1 px-3 py-1.5 text-[12.5px] text-foreground">
          <Building2 className="h-3.5 w-3.5 text-subtle-foreground" />
          <span className={isError ? "text-danger" : undefined}>{orgLabel}</span>
        </div>

        {AUTH_ENABLED && (
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-surface-1 text-muted-foreground hover:border-primary/40 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
}
