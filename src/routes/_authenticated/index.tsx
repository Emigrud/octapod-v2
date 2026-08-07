import { createFileRoute } from "@tanstack/react-router";
import { Radio, Target, Wallet, CalendarDays, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import {
  KpiCard,
  MapPlaceholder,
  BriefingCard,
  SignalsFeed,
  TopOpportunities,
  RecentActivity,
  MarketIntelligence,
  CompetitiveEdge,
} from "@/components/dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — oktapod" },
      {
        name: "description",
        content:
          "Live tender activity, early signals and fit scores for your organization — with an AI situational awareness briefing on top.",
      },
      { property: "og:title", content: "Overview — oktapod" },
      {
        property: "og:description",
        content: "Your market, at a glance — tenders, early signals and fit scores.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-6 py-6">
      <PageHeader
        eyebrow="Overview"
        title="Your market, at a glance."
        description="Live tender activity, early signals and fit scores against your organization profile — with an AI analyst summarizing what changed."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface-1 px-3 py-1.5 text-[12px] text-muted-foreground hover:text-foreground"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Customize dashboard
          </button>
        }
      />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-4">
        <KpiCard
          tile="orange"
          label="Early Signals"
          value="24"
          icon={<Radio className="h-4 w-4" />}
          delta={{ direction: "up", text: "8 vs yesterday" }}
          spark={[6, 8, 7, 10, 9, 12, 11, 14, 13, 16, 18, 24]}
        />
        <KpiCard
          tile="blue"
          label="High-Fit Opportunities"
          value="6"
          icon={<Target className="h-4 w-4" />}
          delta={{ direction: "up", text: "2 new" }}
          spark={[2, 3, 3, 4, 3, 4, 5, 4, 5, 5, 6, 6]}
        />
        <KpiCard
          tile="teal"
          label="Total Project Value"
          value="€8.7B"
          icon={<Wallet className="h-4 w-4" />}
          delta={{ direction: "up", text: "12% vs last 30 days" }}
          spark={[5.2, 5.6, 5.9, 6.3, 6.1, 6.8, 7.0, 7.2, 7.6, 7.9, 8.3, 8.7]}
        />
        <KpiCard
          tile="green"
          label="Projects 6–24 Months Out"
          value="37"
          icon={<CalendarDays className="h-4 w-4" />}
          delta={{ direction: "up", text: "11 new" }}
          spark={[18, 20, 22, 24, 23, 27, 28, 30, 31, 33, 35, 37]}
        />
      </section>

      <section className="min-h-[420px]">
        <BriefingCard />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TopOpportunities />
        <RecentActivity />
        <MarketIntelligence />
        <CompetitiveEdge />
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="min-w-0 min-h-[560px]">
          <MapPlaceholder />
        </div>
        <div className="min-w-0 min-h-[560px]">
          <SignalsFeed />
        </div>
      </section>
    </div>
  );
}
