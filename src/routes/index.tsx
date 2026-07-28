import { createFileRoute } from "@tanstack/react-router";
import { Activity, Radio, FileText, Target, Compass } from "lucide-react";
import { StatCard, EmptyState } from "@/components/octapod";
import { PageHeader } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — OCTAPOD" },
      {
        name: "description",
        content:
          "Live tender activity, active signals and fit scores against your organization profile.",
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
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-6 py-8">
      <PageHeader
        eyebrow="01 · Dashboard"
        title="Your market, at a glance."
        description="Once ingestion is connected, this dashboard will show live tender activity, active signals and fit scores against your organization profile."
      />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          variant="tender"
          label="Open tenders"
          state="empty"
          hint="TED + Hilma, Finland"
        />
        <StatCard
          variant="tender"
          label="New this week"
          state="empty"
          hint="Rolling 7 days"
        />
        <StatCard
          variant="signal"
          label="Active signals"
          state="empty"
          hint="Fingrid + news"
        />
        <StatCard
          variant="neutral"
          label="Fit score ≥ 70"
          state="empty"
          hint="Against your profile"
        />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <EmptyState
          eyebrow="Signal timeline"
          icon={<Activity className="h-5 w-5" />}
          title="No activity yet."
          description="This horizontal timeline will show every signal and tender for your sectors on a shared calendar. The proof of foresight: when a signal later becomes a tender, we mark the date we first saw it."
          accent="tender"
        />
        <EmptyState
          eyebrow="Latest signals"
          icon={<Radio className="h-5 w-5" />}
          title="No signals collected."
          description="Grid plans and press announcements will surface here 6 to 24 months before a matching tender is published."
          accent="signal"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MiniCard
          icon={<FileText className="h-4 w-4 text-tender" />}
          title="Tenders inbox"
          body="Filter by sector, region, value and deadline. Save the filters you use most."
        />
        <MiniCard
          icon={<Target className="h-4 w-4 text-signal" />}
          title="Fit scores"
          body="Each opportunity scored against your capabilities, sectors and project size. Every claim links to its source."
        />
        <MiniCard
          icon={<Compass className="h-4 w-4 text-muted-foreground" />}
          title="Coverage"
          body="Pilot market: Finland. TED + Hilma + Fingrid + Finnish energy press. More markets after the pilot."
        />
      </div>
    </div>
  );
}

function MiniCard({
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
