import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/octapod";
import { PageHeader } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — oktapod" },
      { name: "description", content: "Every deadline, EIA milestone and tender close on a single calendar." },
      { property: "og:title", content: "Calendar — oktapod" },
      { property: "og:description", content: "Deadlines and milestones across tenders and signals." },
    ],
  }),
  component: () => (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-6 py-6">
      <PageHeader eyebrow="Calendar" title="No dates on the calendar yet." description="Tender deadlines, EIA milestones and expected publication windows will land here." />
      <EmptyState icon={<CalendarDays className="h-5 w-5" />} title="Your calendar is empty." description="Connect ingestion to populate the shared deadline calendar." />
    </div>
  ),
});
