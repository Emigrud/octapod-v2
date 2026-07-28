import { createFileRoute } from "@tanstack/react-router";
import { Settings2, Building2, Layers, Globe2 } from "lucide-react";
import { EmptyState } from "@/components/octapod";
import { PageHeader } from "./index";

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
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-6 py-8">
      <PageHeader
        eyebrow="05 · Settings"
        title="Set up your organization profile."
        description="Your capabilities, sectors, target countries, project size range, languages and certifications drive every fit score. Nothing is scored until this profile exists."
      />

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
