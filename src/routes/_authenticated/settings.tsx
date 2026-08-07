import { createFileRoute } from "@tanstack/react-router";
import { Settings2, Building2, Layers, Globe2, Database, Cloud, CheckCircle2, AlertCircle, Unplug } from "lucide-react";
import { EmptyState } from "@/components/octapod";
import { PageHeader } from "@/components/shell/PageHeader";
import { getDataSourceStatus, type DataSourceMode } from "@/lib/data-source.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentOrg, useOrgMembers, useRenameOrg, isAdminOrAbove } from "@/hooks/use-org";


export const Route = createFileRoute("/_authenticated/settings")({
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

      <OrganizationCard />


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

function OrganizationCard() {
  const { data: org, isLoading, isError, error } = useCurrentOrg();
  const { data: members = [], isLoading: membersLoading } = useOrgMembers(org?.id);
  const rename = useRenameOrg();
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);

  const canEdit = isAdminOrAbove(org?.role);
  const value = touched ? name : (org?.name ?? "");
  const trimmed = value.trim();
  const dirty = Boolean(org) && trimmed.length > 0 && trimmed !== org?.name;

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!org || !dirty) return;
    if (trimmed.length < 2 || trimmed.length > 120) {
      toast.error("Organization name must be 2–120 characters.");
      return;
    }
    try {
      await rename.mutateAsync({ orgId: org.id, name: trimmed });
      setTouched(false);
      toast.success("Organization name updated.");
    } catch (mutationError) {
      toast.error(
        mutationError instanceof Error ? mutationError.message : "Could not update the name.",
      );
    }
  }

  return (
    <Card className="border-hairline bg-surface-1/50 shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-sm border border-hairline bg-surface-2/60">
            <Building2 className="h-4 w-4 text-primary" />
          </span>
          <div>
            <CardTitle className="text-[15px] font-medium">Organization</CardTitle>
            <CardDescription className="text-[12.5px]">
              Name and members of the organization you belong to
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        {isLoading && <p className="text-[12.5px] text-muted-foreground">Loading organization…</p>}

        {isError && (
          <p className="text-[12.5px] text-danger">
            {error instanceof Error ? error.message : "Could not load your organization."}
          </p>
        )}

        {!isLoading && !isError && !org && (
          <p className="text-[12.5px] text-muted-foreground">
            Your account is not a member of any organization yet.
          </p>
        )}

        {org && (
          <>
            <form onSubmit={handleSave} className="space-y-2">
              <Label htmlFor="org-name">Organization name</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  id="org-name"
                  value={value}
                  maxLength={120}
                  disabled={!canEdit || rename.isPending}
                  onChange={(e) => {
                    setTouched(true);
                    setName(e.target.value);
                  }}
                  className="max-w-sm"
                />
                {canEdit && (
                  <Button type="submit" disabled={!dirty || rename.isPending}>
                    Save
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-subtle-foreground">
                {canEdit
                  ? "Admins and owners can rename the organization."
                  : "Only admins and owners can rename the organization."}
              </p>
            </form>

            <div>
              <div className="text-[10.5px] uppercase tracking-wider text-subtle-foreground">
                Members
              </div>
              <div className="mt-2 divide-y divide-hairline rounded-md border border-hairline bg-surface-2/40">
                {membersLoading && (
                  <div className="px-3 py-2.5 text-[12.5px] text-muted-foreground">Loading…</div>
                )}
                {!membersLoading && members.length === 0 && (
                  <div className="px-3 py-2.5 text-[12.5px] text-muted-foreground">
                    No members found.
                  </div>
                )}
                {members.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                  >
                    <span className="truncate font-mono text-[12.5px] text-foreground">
                      {member.user_email ?? member.user_id}
                    </span>
                    <Badge variant="secondary" className="text-[10.5px] capitalize">
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function DataSourceStatusPanel({

  status,
}: {
  status: {
    mode: DataSourceMode;
    supabaseConfigured: boolean;
    projectHost?: string;
    projectRef?: string;
  };
}) {
  const modeLabel: Record<DataSourceMode, string> = {
    external_supabase: "External Supabase",
    disconnected: "Not configured",
  };

  const modeDescription: Record<DataSourceMode, string> = {
    external_supabase:
      "The app is pointed at your own external Supabase project. Migrations and data live there.",
    disconnected:
      "No Supabase database is configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to connect your project.",
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
          <Badge variant={isHealthy ? "default" : "destructive"} className="text-[11px]">
            {modeLabel[status.mode]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="grid gap-3 sm:grid-cols-2">
          <StatusRow
            icon={isHealthy ? <Cloud className="h-4 w-4" /> : <Unplug className="h-4 w-4" />}
            label="Backend"
            value={isHealthy ? "External Supabase" : "None"}
            healthy={isHealthy}
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
