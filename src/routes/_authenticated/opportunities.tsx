import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { DataTable, FilterBar, type DataTableColumn } from "@/components/octapod";
import { PageHeader } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities — OCTAPOD" },
      {
        name: "description",
        content:
          "Tenders from TED and Hilma, filtered by sector, region, value and deadline. Deduplicated across sources.",
      },
      { property: "og:title", content: "Opportunities — OCTAPOD" },
      {
        property: "og:description",
        content: "Deduplicated tenders across TED and Hilma with English summaries and fit scores.",
      },
    ],
  }),
  component: OpportunitiesPage,
});

interface OpportunityRow {
  ref: string;
  title: string;
  buyer: string;
  country: string;
  sector: string;
  value: string;
  deadline: string;
  source: string;
}

const columns: DataTableColumn<OpportunityRow>[] = [
  { key: "ref", header: "Reference", mono: true, render: (r) => r.ref, width: "150px" },
  { key: "title", header: "Title", render: (r) => r.title },
  { key: "buyer", header: "Buyer", render: (r) => r.buyer },
  { key: "country", header: "Country", mono: true, render: (r) => r.country, width: "90px" },
  { key: "sector", header: "Sector", render: (r) => r.sector, width: "130px" },
  { key: "value", header: "Value", mono: true, align: "right", render: (r) => r.value, width: "130px" },
  { key: "deadline", header: "Deadline", mono: true, align: "right", render: (r) => r.deadline, width: "120px" },
  { key: "source", header: "Source", render: (r) => r.source, width: "90px" },
];

function OpportunitiesPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-6 py-8">
      <PageHeader
        eyebrow="02 · Opportunities"
        title="No opportunities yet."
        description="Tenders from TED and Hilma will land here, deduplicated across sources. You'll filter by sector, region, value and deadline — and save the filters you use most."
      />

      <FilterBar disabled searchPlaceholder="Search by title, buyer, CPV, region…" />

      <DataTable<OpportunityRow>
        columns={columns}
        rows={[]}
        state="empty"
        emptyTitle="No opportunities in view"
        emptyDescription={
          <span>
            Connect ingestion in a later phase to start collecting TED and Hilma notices. Nothing is
            shown here as sample data — the pilot never mixes stale demos with live records.
          </span>
        }
        emptyAction={
          <div className="inline-flex items-center gap-2 rounded-sm border border-hairline bg-surface-2/60 px-3 py-1.5 text-[11.5px] text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            Ingestion: not connected
          </div>
        }
      />
    </div>
  );
}
