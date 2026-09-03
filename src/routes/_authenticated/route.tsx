import { createFileRoute, Outlet, redirect, ClientOnly } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/shell/AppShell";
import { AUTH_ENABLED } from "@/lib/auth-flags";

export const Route = createFileRoute("/_authenticated")({
  // Auth on: client-only route (the session lives in browser storage, so the
  // guard cannot run on the server). Auth off: SSR the shell normally.
  ssr: AUTH_ENABLED ? false : true,
  beforeLoad: async () => {
    if (!AUTH_ENABLED) return { user: null };
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const shell = (
    <AppShell>
      <Outlet />
    </AppShell>
  );
  // With ssr disabled the server renders nothing here; ClientOnly keeps the
  // first client render identical so hydration stays clean.
  return AUTH_ENABLED ? <ClientOnly fallback={null}>{shell}</ClientOnly> : shell;
}
