import { createFileRoute } from "@tanstack/react-router";
import { Settings2, Building2, Layers, Globe2, Database, Cloud, CheckCircle2, AlertCircle, Unplug } from "lucide-react";
import { EmptyState } from "@/components/octapod";
import { PageHeader } from "@/components/shell/PageHeader";
import { getDataSourceStatus, type DataSourceMode } from "@/lib/data-source.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — OCTAPOD" },
      {
        name: "description",
        content:
          "Set up your organization profile — capabilities, sectors, target countries and project size range.",
      },
      { property: "og:title", content: "Settings — OCTAPOD" },
      {
        property: "og:description",
        content: "Organization profile and preferences that drive fit scores.",
      },
    ],
  }),
  loader: async () => {
    const status = await getDataSourceStatus();
    return { dataSourceStatus: status };
  },
  component: SettingsPage,
});

function SettingsPage() {
  const { dataSourceStatus } = Route.useLoaderData();

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-6 py-8">
      <PageHeader
        eyebrow="05 · Settings"
        title="Set up your organization profile."
        description="Your capabilities, sectors, target countries, project size range, languages and certifications drive every fit score. Nothing is scored until this profile exists."
      />

      <DataSourceStatusPanel status={dataSourceStatus} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <PrefCard
          icon={<Building2 className="h-4 w-4 text-tender" />}
          title="Organization"
          body="Legal name, HQ, size band. Used on every screen and in every AI rationale."
        />
        <PrefCard
          icon={<Layers className="h-4 w-4 text-signal" />}
          title="Capabilities & sectors"
          body="What you build. Renewable energy, grid, pipelines, data centres — pick freely from the pilot taxonomy."
        />
        <PrefCard
          icon={<Globe2 className="h-4 w-4 text-muted-foreground" />}
          title="Target geography"
          body="Countries and regions you'll bid in. Pilot market is Finland; extending later is a data change, not a rewrite."
        />
      </div>

      <EmptyState
        eyebrow="Profile"
        icon={<Settings2 className="h-5 w-5" />}
        title="No profile created."
        description="Authentication and profile editing land in a later phase. Once your profile exists, fit scores appear alongside every opportunity and signal."
      />
    </div>
  );
}

function DataSourceStatusPanel({
  status,
}: {
  status: {
    mode: DataSourceMode;
    lovableCloudConnected: boolean;
    supabaseConfigured: boolean;
    projectHost?: string;
    projectRef?: string;
  };
}) {
  const modeLabel: Record<DataSourceMode, string> = {
    lovable_cloud: "Lovable Cloud",
    external_supabase: "External Supabase",
    disconnected: "Not configured",
  };

  const modeDescription: Record<DataSourceMode, string> = {
    lovable_cloud:
      "This project is using the managed Lovable Cloud backend. Disconnect in Cloud → Advanced if you want to point it to your own Supabase project.",
    external_supabase:
      "Lovable Cloud is disconnected and the app is pointed at an external Supabase database.",
    disconnected:
      "No Supabase database is configured. Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to connect an external project.",
  };

  const isHealthy = status.mode === "external_supabase";

  return (
    <Card className="border-hairline bg-surface-1/50 shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-sm border border-hairline bg-surface-2/60">
              <Database className="h-4 w-4 text-primary" />
            </span>
            <div>
              <CardTitle className="text-[15px] font-medium">Data source</CardTitle>
              <CardDescription className="text-[12.5px]">
                Backend connection status and mode
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={isHealthy ? "default" : status.mode === "lovable_cloud" ? "secondary" : "destructive"}
            className="text-[11px]"
          >
            {modeLabel[status.mode]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="grid gap-3 sm:grid-cols-2">
          <StatusRow
            icon={status.lovableCloudConnected ? <Cloud className="h-4 w-4" /> : <Unplug className="h-4 w-4" />}
            label="Lovable Cloud"
            value={status.lovableCloudConnected ? "Connected" : "Disconnected"}
            healthy={!status.lovableCloudConnected}
          />
          <StatusRow
            icon={status.supabaseConfigured ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            label="Supabase credentials"
            value={status.supabaseConfigured ? "Configured" : "Missing"}
            healthy={status.supabaseConfigured}
          />
        </div>

        {status.projectRef && status.projectHost && (
          <div className="rounded-md border border-hairline bg-surface-2/40 px-3 py-2">
            <div className="text-[10.5px] uppercase tracking-wider text-subtle-foreground">Connected project</div>
            <div className="mt-0.5 font-mono text-[12.5px] text-foreground">
              {status.projectRef}
              <span className="text-subtle-foreground"> · {status.projectHost}</span>
            </div>
          </div>
        )}

        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          {modeDescription[status.mode]}
        </p>
      </CardContent>
    </Card>
  );
}

function StatusRow({
  icon,
  label,
  value,
  healthy,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  healthy: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-hairline bg-surface-2/40 px-3 py-2.5">
      <span className={healthy ? "text-status-success" : "text-status-danger"}>{icon}</span>
      <div className="flex-1">
        <div className="text-[11px] text-subtle-foreground">{label}</div>
        <div className={`text-[12.5px] font-medium ${healthy ? "text-foreground" : "text-status-danger"}`}>{value}</div>
      </div>
    </div>
  );
}

function PrefCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-md border border-hairline bg-surface-1/50 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-sm border border-hairline bg-surface-2/60">
          {icon}
        </span>
        <div className="font-display text-[14px] text-foreground">{title}</div>
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
