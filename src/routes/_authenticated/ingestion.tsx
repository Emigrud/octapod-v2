import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCcw, Play } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/octapod";
import { PageHeader } from "@/components/shell/PageHeader";
import { listIngestRuns, triggerTedIngest, type IngestRunRow } from "@/lib/ingest.functions";

export const Route = createFileRoute("/_authenticated/ingestion")({
  head: () => ({
    meta: [
      { title: "Ingestion — OCTAPOD" },
      {
        name: "description",
        content: "Source health, recent ingestion runs and the manual TED fetch trigger.",
      },
      { property: "og:title", content: "Ingestion — OCTAPOD" },
      {
        property: "og:description",
        content: "Source health, recent ingestion runs and the manual TED fetch trigger.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IngestionPage,
});

const fmtTime = (v: string | null) => (v ? v.replace("T", " ").slice(0, 16) : "—");

function IngestionPage() {
  const queryClient = useQueryClient();
  const loadRuns = useServerFn(listIngestRuns);
  const trigger = useServerFn(triggerTedIngest);
  const [daysBack, setDaysBack] = useState(7);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["ingest-runs"],
    queryFn: () => loadRuns(),
  });

  const run = useMutation({
    mutationFn: (days: number) => trigger({ data: { daysBack: days } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ingest-runs"] });
      void queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    },
  });

  const columns: DataTableColumn<IngestRunRow>[] = [
    { key: "started_at", header: "Started", mono: true, width: "150px", render: (r) => fmtTime(r.started_at) },
    { key: "trigger", header: "Trigger", width: "90px", render: (r) => r.trigger },
    { key: "fetched", header: "Fetched", mono: true, align: "right", width: "90px", render: (r) => r.fetched },
    { key: "new_count", header: "New", mono: true, align: "right", width: "80px", render: (r) => r.new_count },
    {
      key: "updated_count",
      header: "Updated",
      mono: true,
      align: "right",
      width: "90px",
      render: (r) => r.updated_count,
    },
    { key: "failed", header: "Failed", mono: true, align: "right", width: "80px", render: (r) => r.failed },
    {
      key: "duration_ms",
      header: "Duration",
      mono: true,
      align: "right",
      width: "100px",
      render: (r) => (r.duration_ms == null ? "—" : `${(r.duration_ms / 1000).toFixed(1)}s`),
    },
    {
      key: "error_text",
      header: "Error",
      render: (r) => (r.error_text ? <span className="text-destructive">{r.error_text}</span> : "—"),
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-6 py-8">
      <PageHeader
        eyebrow="Admin · Ingestion"
        title="Sources and ingestion runs"
        description="Every fetch writes one run row with counts, duration and errors. If a source fails, the run fails visibly — nothing is filled in with placeholder data."
      />

      <div className="flex flex-wrap items-end gap-3 rounded-md border border-hairline bg-surface-1 p-4">
        <label className="flex flex-col gap-1 text-[11.5px] text-muted-foreground">
          Lookback (days)
          <input
            type="number"
            min={1}
            max={365}
            value={daysBack}
            onChange={(e) => setDaysBack(Math.max(1, Number(e.target.value) || 1))}
            className="w-28 rounded-sm border border-input bg-surface-1 px-2 py-1.5 font-mono text-[12.5px] text-foreground"
          />
        </label>
        <button
          type="button"
          onClick={() => run.mutate(daysBack)}
          disabled={run.isPending}
          className="inline-flex items-center gap-2 rounded-sm bg-accent-primary px-3 py-2 text-[12.5px] font-medium text-accent-primary-foreground disabled:opacity-60"
        >
          <Play className="h-3.5 w-3.5" />
          {run.isPending ? "Fetching from TED…" : "Run TED fetch now"}
        </button>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-2 rounded-sm border border-hairline px-3 py-2 text-[12.5px] text-muted-foreground"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Refresh
        </button>

        {run.data ? (
          <div className="ml-auto font-mono text-[12px] text-muted-foreground">
            {run.data.error ? (
              <span className="text-destructive">Run failed: {run.data.error}</span>
            ) : (
              <>
                fetched {run.data.fetched} · new {run.data.newCount} · updated {run.data.updatedCount} ·
                unchanged {run.data.unchanged} · failed {run.data.failed} ·{" "}
                {(run.data.durationMs / 1000).toFixed(1)}s
              </>
            )}
          </div>
        ) : null}
      </div>

      {data ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Current opportunities" value={data.currentOpportunities} />
          <Stat label="Raw documents stored" value={data.rawDocuments} />
          <Stat
            label="TED last run"
            value={fmtTime((data.sources.find((s) => s.name === "TED")?.last_run_at ?? null) as string | null)}
          />
        </div>
      ) : null}

      <DataTable<IngestRunRow>
        columns={columns}
        rows={data?.runs ?? []}
        state={isLoading ? "loading" : isError ? "error" : (data?.runs.length ?? 0) === 0 ? "empty" : "ready"}
        keyExtractor={(r) => r.id}
        errorMessage={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
        emptyTitle="No ingestion runs yet"
        emptyDescription="Run the TED fetch above, or wait for the daily scheduled run."
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-hairline bg-surface-1 p-4">
      <div className="text-eyebrow">{label}</div>
      <div className="mt-1 font-mono text-[18px] text-foreground">{value}</div>
    </div>
  );
}
