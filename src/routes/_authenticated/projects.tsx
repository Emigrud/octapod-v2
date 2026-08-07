import { createFileRoute } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";
import { EmptyState } from "@/components/octapod";
import { PageHeader } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({
    meta: [
      { title: "Projects — oktapod" },
      { name: "description", content: "Track projects across their lifecycle — from early signal to tender to award." },
      { property: "og:title", content: "Projects — oktapod" },
      { property: "og:description", content: "Project lifecycle tracking for Nordic & Baltic infrastructure." },
    ],
  }),
  component: () => (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-6 py-6">
      <PageHeader eyebrow="Projects" title="No projects tracked yet." description="Projects merge signals and tenders under one identity — follow each one from first mention to award." />
      <EmptyState icon={<FolderKanban className="h-5 w-5" />} title="Your project tracker is empty." description="Once ingestion is connected, matched signals and tenders will roll up into projects here." />
    </div>
  ),
});
