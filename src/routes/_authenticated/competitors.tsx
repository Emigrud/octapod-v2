import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/octapod";
import { PageHeader } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/competitors")({
  head: () => ({
    meta: [
      { title: "Competitors — oktapod" },
      { name: "description", content: "Which contractors are winning what, where, and how often." },
      { property: "og:title", content: "Competitors — oktapod" },
      { property: "og:description", content: "Competitor intelligence for the Nordics & Baltics." },
    ],
  }),
  component: () => (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-6 py-6">
      <PageHeader eyebrow="Competitors" title="No competitors tracked yet." description="Once tenders and awards are ingested, competitor win-rates and specialties will surface here." />
      <EmptyState icon={<Users className="h-5 w-5" />} title="Competitor board is empty." />
    </div>
  ),
});
