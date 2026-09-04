import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/octapod";
import { PageHeader } from "@/components/shell/PageHeader";
import { listOpportunities, type OpportunityRow } from "@/lib/ingest.functions";

export const Route = createFileRoute("/_authenticated/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities — OCTAPOD" },
      {
        name: "description",
        content:
          "Tenders ingested from TED, filtered by CPV group, publication date and deadline. Every row links to the original notice.",
      },
      { property: "og:title", content: "Opportunities — OCTAPOD" },
      {
        property: "og:description",
        content: "Real TED tenders with source links, values and deadlines.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OpportunitiesPage,
});

const CPV_GROUPS = [
  { value: "", label: "All CPV groups" },
  { value: "45", label: "45 · Construction" },
  { value: "71", label: "71 · Engineering" },
  { value: "09", label: "09 · Energy & fuels" },
  { value: "44", label: "44 · Pipelines & water" },
  { value: "51", label: "51 · Installation & mechanical" },
  { value: "65", label: "65 · Utilities" },
];

const PAGE_SIZE = 100;

const fmtDate = (v: string | null) => (v ? v.slice(0, 10) : "—");
const fmtValue = (v: number | null, currency: string | null) =>
  v == null ? "—" : `${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(v)} ${currency ?? ""}`.trim();

function OpportunitiesPage() {
  const load = useServerFn(listOpportunities);

  const [cpvGroup, setCpvGroup] = useState("");
  const [publishedFrom, setPublishedFrom] = useState("");
  const [deadlineBefore, setDeadlineBefore] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["opportunities", cpvGroup, publishedFrom, deadlineBefore, search],
    queryFn: () =>
      load({
        data: {
          cpvGroup: cpvGroup || null,
          publishedFrom: publishedFrom ? new Date(publishedFrom).toISOString() : null,
          deadlineBefore: deadlineBefore ? new Date(deadlineBefore).toISOString() : null,
          search: search.trim() || null,
        },
      }),
  });

  const rows = data?.rows ?? [];
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = useMemo(
    () => rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [rows, page],
  );

  const columns: DataTableColumn<OpportunityRow>[] = [
    {
      key: "native_id",
      header: "Reference",
      mono: true,
      width: "130px",
      render: (r) => (
        <a
          href={r.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-accent-primary hover:underline"
        >
          {r.native_id}
          <ExternalLink className="h-3 w-3" />
        </a>
      ),
    },
    { key: "title", header: "Title", render: (r) => r.title ?? "—" },
    { key: "buyer_name", header: "Buyer", width: "220px", render: (r) => r.buyer_name ?? "—" },
    { key: "country", header: "Country", mono: true, width: "90px", render: (r) => r.country ?? "—" },
    {
      key: "cpv",
      header: "CPV",
      mono: true,
      width: "110px",
      render: (r) => (r.cpv?.length ? r.cpv[0] : "—"),
    },
    {
      key: "is_supply",
      header: "Type",
      width: "110px",
      render: (r) =>
        r.is_supply == null ? "—" : r.is_supply ? "Supply" : "Works / services",
    },
    {
      key: "est_value",
      header: "Value",
      mono: true,
      align: "right",
      width: "150px",
      render: (r) => fmtValue(r.est_value, r.currency),
    },
    {
      key: "published_at",
      header: "Published",
      mono: true,
      align: "right",
      width: "110px",
      render: (r) => fmtDate(r.published_at),
    },
    {
      key: "deadline_at",
      header: "Deadline",
      mono: true,
      align: "right",
      width: "110px",
      render: (r) => fmtDate(r.deadline_at),
    },
    { key: "version", header: "Ver.", mono: true, align: "right", width: "60px", render: (r) => r.version },
  ];

  const reset = () => setPage(0);

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-6 py-8">
      <PageHeader
        eyebrow="02 · Opportunities"
        title="Tenders from TED"
        description="Live notices ingested from TED for the pilot market and sectors. Amended notices are versioned, never overwritten — every row links to the original notice."
      />

      <div className="flex flex-wrap items-end gap-3 rounded-md border border-hairline bg-surface-1 p-4">
        <Field label="CPV group">
          <select
            value={cpvGroup}
            onChange={(e) => {
              setCpvGroup(e.target.value);
              reset();
            }}
            className="w-52 rounded-sm border border-input bg-surface-1 px-2 py-1.5 text-[12.5px] text-foreground"
          >
            {CPV_GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Published from">
          <input
            type="date"
            value={publishedFrom}
            onChange={(e) => {
              setPublishedFrom(e.target.value);
              reset();
            }}
            className="rounded-sm border border-input bg-surface-1 px-2 py-1.5 font-mono text-[12.5px] text-foreground"
          />
        </Field>
        <Field label="Deadline before">
          <input
            type="date"
            value={deadlineBefore}
            onChange={(e) => {
              setDeadlineBefore(e.target.value);
              reset();
            }}
            className="rounded-sm border border-input bg-surface-1 px-2 py-1.5 font-mono text-[12.5px] text-foreground"
          />
        </Field>
        <Field label="Search">
          <input
            type="search"
            value={search}
            placeholder="Title or buyer…"
            onChange={(e) => {
              setSearch(e.target.value);
              reset();
            }}
            className="w-64 rounded-sm border border-input bg-surface-1 px-2 py-1.5 text-[12.5px] text-foreground"
          />
        </Field>
        <div className="ml-auto font-mono text-[12px] text-muted-foreground">
          {rows.length} tenders · page {page + 1}/{pageCount}
        </div>
      </div>

      <DataTable<OpportunityRow>
        columns={columns}
        rows={current}
        state={isLoading ? "loading" : isError ? "error" : rows.length === 0 ? "empty" : "ready"}
        keyExtractor={(r) => r.id}
        errorMessage={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
        emptyTitle="No opportunities in view"
        emptyDescription="Run a TED fetch on the Ingestion screen, or widen the filters. Nothing is shown here as sample data."
      />

      {pageCount > 1 ? (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-sm border border-hairline px-3 py-1.5 text-[12.5px] text-muted-foreground disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
            className="rounded-sm border border-hairline px-3 py-1.5 text-[12.5px] text-muted-foreground disabled:opacity-50"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-[11.5px] text-muted-foreground">
      {label}
      {children}
    </label>
  );
}
