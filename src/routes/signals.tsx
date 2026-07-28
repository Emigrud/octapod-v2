import { createFileRoute } from "@tanstack/react-router";
import { Radio } from "lucide-react";
import { EmptyState, StatCard } from "@/components/octapod";
import { PageHeader } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/signals")({
  head: () => ({
    meta: [
      { title: "Signals — OCTAPOD" },
      {
        name: "description",
        content:
          "Grid operator plans and press announcements — the 6-to-24-month lead before a tender exists.",
      },
      { property: "og:title", content: "Signals — OCTAPOD" },
      {
        property: "og:description",
        content:
          "Early signals: grid plans and press. When a signal later becomes a tender, OCTAPOD marks the date we first saw it.",
      },
    ],
  }),
  component: SignalsPage,
});

function SignalsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-6 py-8">
      <PageHeader
        eyebrow="03 · Signals"
        title="No signals yet."
        description="Grid plans, press and corporate announcements will stream in here — the 6-to-24-month lead before a matching tender is published. When a signal later becomes a tender, we mark the date we first saw it."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard variant="signal" label="Fingrid updates" state="empty" hint="Grid plans & news" />
        <StatCard variant="signal" label="Press mentions" state="empty" hint="Curated Finnish feeds" />
        <StatCard variant="tender" label="Signal → tender links" state="empty" hint="Foresight proof" />
      </div>

      <EmptyState
        eyebrow="Signal feed"
        accent="signal"
        icon={<Radio className="h-5 w-5" />}
        title="The feed is quiet."
        description="Once Fingrid and press ingestion is connected, signals will appear here in reverse chronological order, tagged by sector, entity and country. Every card links back to its source."
      />
    </div>
  );
}
