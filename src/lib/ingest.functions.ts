/**
 * PHASE 1 — server functions for the opportunities list and the ingestion admin.
 *
 * Reads run server-side. While the Phase 0B auth kill-switch (AUTH_ENABLED) is
 * off there is no browser session to satisfy the "authenticated can read"
 * policies, so the read path executes on the server with the service role and
 * returns only the projected, non-sensitive market columns. No key is ever
 * exposed to the browser.
 */
import { createServerFn } from "@tanstack/react-start";

export interface OpportunityRow {
  id: string;
  native_id: string;
  title: string | null;
  buyer_name: string | null;
  country: string | null;
  cpv: string[];
  sectors: string[];
  nuts: string[];
  est_value: number | null;
  currency: string | null;
  published_at: string | null;
  deadline_at: string | null;
  status: string;
  version: number;
  url: string;
}

export interface OpportunityQuery {
  cpvGroup?: string | null;
  publishedFrom?: string | null;
  deadlineBefore?: string | null;
  search?: string | null;
  limit?: number;
}

const CPV_GROUPS: { value: string; label: string }[] = [
  { value: "45", label: "45 · Construction" },
  { value: "71", label: "71 · Engineering" },
  { value: "09", label: "09 · Energy & fuels" },
  { value: "65", label: "65 · Utilities" },
];

export const getCpvGroups = createServerFn({ method: "GET" }).handler(async () => CPV_GROUPS);

export const listOpportunities = createServerFn({ method: "GET" })
  .inputValidator((input: OpportunityQuery | undefined) => input ?? {})
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };

    const limit = Math.min(Math.max(data.limit ?? 1500, 1), 5000);

    let q = db
      .from("opportunities")
      .select(
        "id,native_id,title,buyer_name,country,cpv,sectors,nuts,est_value,currency,published_at,deadline_at,status,version",
        { count: "exact" },
      )
      .is("superseded_by", null)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (data.publishedFrom) q = q.gte("published_at", data.publishedFrom);
    if (data.deadlineBefore) q = q.lte("deadline_at", data.deadlineBefore);
    if (data.search) q = q.or(`title.ilike.%${data.search}%,buyer_name.ilike.%${data.search}%`);

    const { data: rows, error, count } = await q;
    if (error) throw new Error(`Loading opportunities failed: ${error.message}`);

    let list = (rows ?? []) as Omit<OpportunityRow, "url">[];
    if (data.cpvGroup) {
      list = list.filter((r) => (r.cpv ?? []).some((c) => c.startsWith(data.cpvGroup!)));
    }

    return {
      total: count ?? list.length,
      rows: list.map((r) => ({
        ...r,
        url: `https://ted.europa.eu/en/notice/-/detail/${r.native_id}`,
      })) as OpportunityRow[],
    };
  });

export interface SourceRow {
  id: string;
  name: string;
  country: string | null;
  kind: string;
  access_method: string;
  schedule: string | null;
  status: string;
  last_run_at: string | null;
  last_record_count: number | null;
  cursor_at: string | null;
}

export interface IngestRunRow {
  id: string;
  started_at: string;
  finished_at: string | null;
  fetched: number;
  new_count: number;
  updated_count: number;
  failed: number;
  duration_ms: number | null;
  error_text: string | null;
  trigger: string;
  window_from: string | null;
}

export const listIngestRuns = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as unknown as { from: (t: string) => any };

  const { data: runs, error } = await db
    .from("ingest_runs")
    .select("id,started_at,finished_at,fetched,new_count,updated_count,failed,duration_ms,error_text,trigger,window_from")
    .order("started_at", { ascending: false })
    .limit(25);
  if (error) throw new Error(`Loading ingest runs failed: ${error.message}`);

  const { data: sources, error: srcErr } = await db
    .from("sources")
    .select("id,name,country,kind,access_method,schedule,status,last_run_at,last_record_count,cursor_at");
  if (srcErr) throw new Error(`Loading sources failed: ${srcErr.message}`);

  const { count: oppCount } = await db
    .from("opportunities")
    .select("id", { count: "exact", head: true })
    .is("superseded_by", null);
  const { count: rawCount } = await db.from("raw_documents").select("id", { count: "exact", head: true });

  return {
    runs: (runs ?? []) as IngestRunRow[],
    sources: (sources ?? []) as SourceRow[],
    currentOpportunities: (oppCount as number | null) ?? 0,
    rawDocuments: (rawCount as number | null) ?? 0,
  };
});

/** Manual trigger from the ingestion admin screen. */
export const triggerTedIngest = createServerFn({ method: "POST" })
  .inputValidator((input: { daysBack?: number } | undefined) => input ?? {})
  .handler(async ({ data }) => {
    const { runTedIngest } = await import("@/lib/ted.server");
    return runTedIngest({ trigger: "manual", daysBack: data.daysBack ?? undefined });
  });
