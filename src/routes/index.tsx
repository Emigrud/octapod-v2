import { createFileRoute } from "@tanstack/react-router";
import { Radio, Target, Wallet, CalendarDays, Globe2, SlidersHorizontal } from "lucide-react";
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
      { title: "Dashboard — OCTAPOD" },
      {
        name: "description",
        content:
          "Live tender activity, early signals and fit scores for your organization — with an AI situational awareness briefing on top.",
      },
      { property: "og:title", content: "Dashboard — OCTAPOD" },
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
        eyebrow="01 · Overview"
        title="Your market, at a glance."
        description="Live tender activity, early signals and fit scores against your organization profile — with an AI analyst summarizing what changed."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-sm border border-hairline bg-surface-1/60 px-3 py-1.5 text-[12px] text-muted-foreground hover:text-foreground"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Customize dashboard
          </button>
        }
      />

      {/* Row 1 — KPI strip */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard
          variant="signal"
          label="Early signals"
          value="24"
          icon={<Radio className="h-4 w-4" />}
          delta={{ direction: "up", text: "8 vs yesterday" }}
          spark={[6, 8, 7, 10, 9, 12, 11, 14, 13, 16, 18, 24]}
        />
        <KpiCard
          variant="tender"
          label="High-fit opportunities"
          value="6"
          icon={<Target className="h-4 w-4" />}
          delta={{ direction: "up", text: "2 new" }}
          spark={[2, 3, 3, 4, 3, 4, 5, 4, 5, 5, 6, 6]}
        />
        <KpiCard
          variant="tender"
          label="Total project value"
          value="€8.7B"
          icon={<Wallet className="h-4 w-4" />}
          delta={{ direction: "up", text: "12% vs last 30 days" }}
          spark={[5.2, 5.6, 5.9, 6.3, 6.1, 6.8, 7.0, 7.2, 7.6, 7.9, 8.3, 8.7]}
        />
        <KpiCard
          variant="tender"
          label="Projects 6–24 months out"
          value="37"
          icon={<CalendarDays className="h-4 w-4" />}
          delta={{ direction: "up", text: "11 new" }}
          spark={[18, 20, 22, 24, 23, 27, 28, 30, 31, 33, 35, 37]}
        />
        <KpiCard
          variant="neutral"
          label="Countries covered"
          value="8"
          icon={<Globe2 className="h-4 w-4" />}
          delta={{ direction: "flat", text: "Nordic & Baltic" }}
          spark={[3, 4, 4, 5, 6, 6, 7, 7, 7, 8, 8, 8]}
        />
      </section>

      {/* Row 2 — Map · Briefing · Signals */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,5fr)_minmax(0,3fr)]">
        <div className="min-h-[540px]">
          <MapPlaceholder />
        </div>
        <div className="min-h-[540px]">
          <BriefingCard />
        </div>
        <div className="min-h-[540px]">
          <SignalsFeed />
        </div>
      </section>

      {/* Row 3 — bottom four */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TopOpportunities />
        <RecentActivity />
        <MarketIntelligence />
        <CompetitiveEdge />
      </section>
    </div>
  );
}
