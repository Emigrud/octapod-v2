import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileText, CalendarClock, Wallet, Building2, ExternalLink, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/octapod";
import { KpiCard } from "@/components/dashboard";
import { getDashboardSummary } from "@/lib/ingest.functions";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Overview — OCTAPOD" },
      {
        name: "description",
        content:
          "Live counts, values and deadlines computed from the tender notices ingested from TED. No estimates, no sample data.",
      },
      { property: "og:title", content: "Overview — OCTAPOD" },
      {
        property: "og:description",
        content: "Real ingested tender activity for the pilot market, at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

const nf = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
const fmtDate = (v: string | null) => (v ? v.slice(0, 10) : "—");

function DashboardPage() {
  const load = useServerFn(getDashboardSummary);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => load(),
  });

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-6 py-6">
      <PageHeader
        eyebrow="01 · Overview"
        title="Your market, at a glance."
        description="Every figure below is counted directly from tender notices ingested from TED. Nothing on this screen is estimated or generated."
      />

      {isError ? (
        <div className="rounded-md border border-danger/40 bg-surface-1 px-4 py-3 text-[12.5px] text-danger">
          {error instanceof Error ? error.message : "Loading the overview failed."}
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          tile="blue"
          label="Tenders ingested"
          value={isLoading ? "—" : nf.format(data?.totalOpportunities ?? 0)}
          icon={<FileText className="h-4 w-4" />}
          hint="Current versions from TED"
        />
        <KpiCard
          tile="teal"
          label="Published last 7 days"
          value={isLoading ? "—" : nf.format(data?.publishedLast7Days ?? 0)}
          icon={<CalendarClock className="h-4 w-4" />}
          hint="By notice publication date"
        />
        <KpiCard
          tile="orange"
          label="Closing next 30 days"
          value={isLoading ? "—" : nf.format(data?.closingNext30Days ?? 0)}
          icon={<CalendarClock className="h-4 w-4" />}
          hint="Submission deadline in window"
        />
        <KpiCard
          tile="green"
          label="Stated value (EUR)"
          value={
            isLoading
              ? "—"
              : data?.totalEstValue
                ? `€${nf.format(data.totalEstValue.amount)}`
                : "—"
          }
          icon={<Wallet className="h-4 w-4" />}
          hint="Sum of values stated in notices only"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col rounded-md border border-hairline bg-surface-1">
          <header className="flex items-center justify-between px-4 py-3 hairline-b">
            <div className="font-display text-[14px] font-semibold text-foreground">
              Latest tenders from TED
            </div>
            <Link to="/opportunities" className="text-[12px] font-medium text-primary hover:opacity-80">
              View all
            </Link>
          </header>

          {isLoading ? (
            <div className="px-4 py-8 text-[12.5px] text-muted-foreground">Loading…</div>
          ) : (data?.recent.length ?? 0) === 0 ? (
            <EmptyState
              className="border-0"
              icon={<FileText className="h-5 w-5" />}
              title="No tenders ingested yet."
              description="Run a TED fetch on the Ingestion screen. Nothing is shown here as sample data."
            />
          ) : (
            <ul className="divide-y divide-hairline">
              {data!.recent.map((r) => (
                <li key={r.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 truncate text-[12.5px] font-medium text-foreground hover:text-primary"
                    >
                      {r.title ?? r.native_id}
                      <ExternalLink className="h-3 w-3 shrink-0 text-subtle-foreground" />
                    </a>
                    <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {[r.buyer_name, r.country, r.cpv?.[0]].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {fmtDate(r.published_at)}
                    </div>
                    <div className="mt-0.5 font-mono text-[10.5px] text-subtle-foreground">
                      Deadline {fmtDate(r.deadline_at)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <footer className="hairline-t px-4 py-3">
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-primary hover:opacity-80"
            >
              Explore all tenders <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </footer>
        </div>

        <div className="flex flex-col rounded-md border border-hairline bg-surface-1">
          <header className="px-4 py-3 hairline-b font-display text-[14px] font-semibold text-foreground">
            Most active buyers
          </header>
          {isLoading ? (
            <div className="px-4 py-8 text-[12.5px] text-muted-foreground">Loading…</div>
          ) : (data?.topBuyers.length ?? 0) === 0 ? (
            <div className="px-4 py-8 text-[12.5px] text-muted-foreground">
              No buyers recorded yet.
            </div>
          ) : (
            <ul className="divide-y divide-hairline">
              {data!.topBuyers.map((b) => (
                <li key={b.name} className="flex items-center gap-3 px-4 py-3">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-subtle-foreground" />
                  <span className="min-w-0 flex-1 truncate text-[12.5px] text-foreground">
                    {b.name}
                  </span>
                  <span className="font-mono text-[12px] text-muted-foreground tabular">
                    {b.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <footer className="hairline-t px-4 py-3 font-mono text-[10.5px] text-subtle-foreground">
            Last ingest ·{" "}
            {isLoading ? "…" : data?.lastIngestAt ? data.lastIngestAt.slice(0, 16).replace("T", " ") : "never"}
          </footer>
        </div>
      </section>
    </div>
  );
}
