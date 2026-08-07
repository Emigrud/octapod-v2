import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/octapod";
import { PageHeader } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — oktapod" },
      { name: "description", content: "Market outlooks and sector reports generated from your data." },
      { property: "og:title", content: "Reports — oktapod" },
      { property: "og:description", content: "Nordic & Baltic infrastructure market reports." },
    ],
  }),
  component: () => (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-6 py-6">
      <PageHeader eyebrow="Reports" title="No reports generated yet." description="Sector outlooks and market briefings will appear here as the analyst compiles them." />
      <EmptyState icon={<BarChart3 className="h-5 w-5" />} title="Report library is empty." />
    </div>
  ),
});
