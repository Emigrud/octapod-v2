/**
 * PHASE 1 — TED ingestion (server-only).
 *
 * Source: TED Search API v3, POST https://api.ted.europa.eu/v3/notices/search
 * Authentication: none (per the Source & Access Register).
 *
 * Implements the five universal ingestion rules from Master Strategy §4:
 *  1. the original payload is stored with source_url, fetched_at, language, hash
 *  2. identity uniqueness on (source_id, native_id)
 *  3. content hash detects amendments -> a new version row, never an overwrite
 *  4. cursor with a 7-day overlap lookback on every scheduled run
 *  5. one ingest_runs row per run with counts, duration and errors
 *
 * No mock data: if TED fails, the run is recorded as failed and the error is
 * surfaced. Country is a data column; the Finland filter lives in this
 * source's query definition, not in the schema or the UI.
 */
import { createHash } from "crypto";

const TED_SEARCH_URL = "https://api.ted.europa.eu/v3/notices/search";
const TED_SOURCE_NAME = "TED";

/**
 * Pilot scope: Finland (ISO alpha-3 as TED expects), CPV divisions
 * 45 construction, 71 engineering, 09 energy, 44 materials/pipelines,
 * 51 installation, 65 utilities.
 *
 * Divisions 31, 42, 48 and 72 were measured against the same window and
 * deliberately excluded — see docs/pilot-source-register.md Part B.
 */
export const TED_COUNTRY = "FIN";
export const TED_CPV_DIVISIONS = ["45", "71", "09", "44", "51", "65"] as const;

const TED_FIELDS = [
  "publication-number",
  "publication-date",
  "notice-title",
  "title-proc",
  "buyer-name",
  "buyer-country",
  "links",
  "classification-cpv",
  "place-of-performance",
  "place-of-performance-country-lot",
  "deadline-receipt-tender-date-lot",
  "deadline-receipt-request-date-lot",
  "estimated-value-lot",
  "estimated-value-cur-lot",
  "official-language",
  "notice-type",
  "form-type",
  "change-notice-version-identifier",
];

type Json = Record<string, unknown>;

export interface IngestOptions {
  /** How many days back to search. Scheduled runs use the cursor + 7-day overlap. */
  daysBack?: number;
  /** Hard cap on notices processed in one run (backfill safety valve). */
  maxRecords?: number;
  trigger?: "manual" | "cron" | "backfill";
}

export interface IngestResult {
  runId: string | null;
  sourceId: string | null;
  fetched: number;
  newCount: number;
  updatedCount: number;
  unchanged: number;
  failed: number;
  durationMs: number;
  windowFrom: string | null;
  windowTo: string;
  error: string | null;
}

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Json;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

/** Rule 3: deterministic content fingerprint over the whole stored record. */
export function contentHash(payload: unknown): string {
  return createHash("sha256").update(stableStringify(payload)).digest("hex");
}

const LANG_MAP: Record<string, string> = { FIN: "fi", SWE: "sv", ENG: "en", fin: "fi", swe: "sv", eng: "en" };

function asArray(v: unknown): unknown[] {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

function uniqueStrings(v: unknown): string[] {
  return Array.from(
    new Set(asArray(v).filter((x): x is string => typeof x === "string" && x.length > 0)),
  );
}

/**
 * Titles arrive either as a plain string (legacy schema) or as a language map
 * (eForms). Prefer English, then Finnish, then Swedish, then anything present.
 */
function pickLocalised(value: unknown): { text: string | null; lang: string | null } {
  if (typeof value === "string") return { text: value, lang: null };
  if (!value || typeof value !== "object") return { text: null, lang: null };
  const map = value as Record<string, unknown>;
  for (const key of ["eng", "ENG", "fin", "FIN", "swe", "SWE", ...Object.keys(map)]) {
    const raw = map[key];
    const text = Array.isArray(raw) ? raw[0] : raw;
    if (typeof text === "string" && text.length > 0) {
      return { text, lang: LANG_MAP[key] ?? key.toLowerCase().slice(0, 2) };
    }
  }
  return { text: null, lang: null };
}

/**
 * TED emits dates as `2026-07-01+02:00` (date plus UTC offset, no time part),
 * which `new Date()` cannot parse. Insert midnight local time before parsing.
 * Timestamps like `2026-08-15T12:00:00+03:00` pass through unchanged.
 */
export function parseDate(value: unknown): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string" || raw.length < 8) return null;
  const dateOnlyWithOffset = raw.match(/^(\d{4}-\d{2}-\d{2})(Z|[+-]\d{2}:?\d{2})$/);
  const normalised = dateOnlyWithOffset
    ? `${dateOnlyWithOffset[1]}T00:00:00${dateOnlyWithOffset[2]}`
    : raw;
  const d = new Date(normalised);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}


function parseNumber(value: unknown): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : null;
}

const CPV_SECTORS: Record<string, string> = {
  "45": "construction",
  "71": "engineering",
  "09": "energy",
  "65": "utilities",
};

function sectorsFromCpv(cpv: string[]): string[] {
  return Array.from(
    new Set(cpv.map((c) => CPV_SECTORS[c.slice(0, 2)]).filter((s): s is string => Boolean(s))),
  );
}

/** NUTS codes look like FI1C2; plain ISO alpha-3 country codes are filtered out. */
function nutsFromPlaces(values: string[]): string[] {
  return values.filter((v) => /^[A-Z]{2}[0-9A-Z]{1,3}$/.test(v) && !/^[A-Z]{3}$/.test(v));
}

export interface NormalisedNotice {
  nativeId: string;
  url: string | null;
  lang: string | null;
  title: string | null;
  buyerName: string | null;
  country: string | null;
  nuts: string[];
  cpv: string[];
  sectors: string[];
  estValue: number | null;
  currency: string | null;
  publishedAt: string | null;
  deadlineAt: string | null;
  status: string;
  payload: Json;
}

/**
 * Normalise a TED search record. Tolerates both the eForms field shapes and
 * the older legacy schema (plain-string titles, missing lot-level fields).
 */
export function normaliseNotice(record: Json): NormalisedNotice | null {
  const nativeId = typeof record["publication-number"] === "string" ? record["publication-number"] : null;
  if (!nativeId) return null;

  const links = (record["links"] ?? {}) as Record<string, Record<string, string>>;
  const htmlLinks = links["html"] ?? {};
  const url =
    htmlLinks["ENG"] ??
    htmlLinks["FIN"] ??
    Object.values(htmlLinks)[0] ??
    `https://ted.europa.eu/en/notice/-/detail/${nativeId}`;

  const titlePick = pickLocalised(record["notice-title"] ?? record["title-proc"]);
  const buyerPick = pickLocalised(record["buyer-name"]);

  const officialLang = uniqueStrings(record["official-language"])[0];
  const lang = officialLang ? (LANG_MAP[officialLang] ?? officialLang.toLowerCase().slice(0, 2)) : titlePick.lang;

  const cpv = uniqueStrings(record["classification-cpv"]);
  const places = uniqueStrings(record["place-of-performance"]);
  const country =
    uniqueStrings(record["place-of-performance-country-lot"])[0] ??
    uniqueStrings(record["buyer-country"])[0] ??
    null;

  const deadlineAt =
    parseDate(record["deadline-receipt-tender-date-lot"]) ??
    parseDate(record["deadline-receipt-request-date-lot"]);

  return {
    nativeId,
    url,
    lang,
    title: titlePick.text,
    buyerName: buyerPick.text,
    country,
    nuts: nutsFromPlaces(places),
    cpv,
    sectors: sectorsFromCpv(cpv),
    estValue: parseNumber(record["estimated-value-lot"]),
    currency: uniqueStrings(record["estimated-value-cur-lot"])[0] ?? null,
    publishedAt: parseDate(record["publication-date"]),
    deadlineAt,
    status: deadlineAt && new Date(deadlineAt).getTime() < Date.now() ? "closed" : "open",
    payload: record,
  };
}

/* ------------------------------------------------------------------ */
/* TED fetch                                                           */
/* ------------------------------------------------------------------ */

function buildQuery(fromISO: string, toISO: string): string {
  const cpv = TED_CPV_DIVISIONS.map((d) => `${d}*`).join(" ");
  const day = (iso: string) => iso.slice(0, 10).replace(/-/g, "");
  return (
    `(classification-cpv IN (${cpv})) AND ` +
    `((buyer-country IN (${TED_COUNTRY})) OR (place-of-performance-country-lot IN (${TED_COUNTRY}))) AND ` +
    `(publication-date >= ${day(fromISO)} AND publication-date <= ${day(toISO)})`
  );
}

async function fetchTedPage(query: string, token: string | null) {
  const body: Json = {
    query,
    fields: TED_FIELDS,
    limit: 250,
    scope: "ALL",
    paginationMode: "ITERATION",
    onlyLatestVersions: false,
  };
  if (token) body["iterationNextToken"] = token;

  const res = await fetch(TED_SEARCH_URL, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`TED search failed (HTTP ${res.status}): ${text.slice(0, 400)}`);
  return JSON.parse(text) as {
    notices?: Json[];
    totalNoticeCount?: number;
    iterationNextToken?: string | null;
  };
}

/* ------------------------------------------------------------------ */
/* ingestion                                                           */
/* ------------------------------------------------------------------ */

type Admin = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];
// The generated Database type is empty for this external project, so the
// ingestion tables are addressed through a loosely typed client handle.
type Db = { from: (t: string) => any };

async function getTedSource(db: Db) {
  const { data, error } = await db
    .from("sources")
    .select("id,name,cursor_at,last_run_at")
    .eq("name", TED_SOURCE_NAME)
    .maybeSingle();
  if (error) throw new Error(`Reading sources failed: ${error.message}`);
  if (!data) throw new Error("Source 'TED' is missing. Run db/migrations/0002_phase1_ted_ingestion.sql first.");
  return data as { id: string; cursor_at: string | null; last_run_at: string | null };
}

export async function runTedIngest(options: IngestOptions = {}): Promise<IngestResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as unknown as Db;

  const startedAt = new Date();
  const trigger = options.trigger ?? "manual";
  const maxRecords = options.maxRecords ?? 5000;

  let runId: string | null = null;
  let sourceId: string | null = null;
  let fetched = 0;
  let newCount = 0;
  let updatedCount = 0;
  let unchanged = 0;
  let failed = 0;
  let windowFrom: string | null = null;
  const windowTo = startedAt.toISOString();

  try {
    const source = await getTedSource(db);
    sourceId = source.id;

    // Rule 4: cursor with a deliberate 7-day overlap. An explicit daysBack
    // (backfill) always wins.
    const overlapMs = 7 * 24 * 60 * 60 * 1000;
    const from = options.daysBack
      ? new Date(startedAt.getTime() - options.daysBack * 24 * 60 * 60 * 1000)
      : source.cursor_at
        ? new Date(new Date(source.cursor_at).getTime() - overlapMs)
        : new Date(startedAt.getTime() - 30 * 24 * 60 * 60 * 1000);
    windowFrom = from.toISOString();

    const { data: runRow, error: runErr } = await db
      .from("ingest_runs")
      .insert({
        source_id: sourceId,
        started_at: windowTo,
        trigger,
        window_from: windowFrom,
        window_to: windowTo,
      })
      .select("id")
      .single();
    if (runErr) throw new Error(`Creating ingest run failed: ${runErr.message}`);
    runId = (runRow as { id: string }).id;

    const query = buildQuery(windowFrom, windowTo);
    let token: string | null = null;

    do {
      const page = await fetchTedPage(query, token);
      const notices = page.notices ?? [];
      token = page.iterationNextToken ?? null;
      if (notices.length === 0) break;

      for (const record of notices) {
        fetched += 1;
        try {
          const outcome = await storeNotice(db, sourceId, record);
          if (outcome === "new") newCount += 1;
          else if (outcome === "amended") updatedCount += 1;
          else unchanged += 1;
        } catch (e) {
          failed += 1;
          console.error("[TED] record failed", e instanceof Error ? e.message : e);
        }
        if (fetched >= maxRecords) {
          token = null;
          break;
        }
      }
    } while (token && fetched < maxRecords);

    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();

    await db
      .from("ingest_runs")
      .update({
        finished_at: finishedAt.toISOString(),
        fetched,
        new_count: newCount,
        updated_count: updatedCount,
        failed,
        duration_ms: durationMs,
      })
      .eq("id", runId);

    await db
      .from("sources")
      .update({
        last_run_at: finishedAt.toISOString(),
        last_record_count: fetched,
        cursor_at: windowTo,
        status: failed > 0 && fetched === failed ? "error" : "active",
      })
      .eq("id", sourceId);

    return {
      runId,
      sourceId,
      fetched,
      newCount,
      updatedCount,
      unchanged,
      failed,
      durationMs,
      windowFrom,
      windowTo,
      error: null,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();
    if (runId) {
      await db
        .from("ingest_runs")
        .update({
          finished_at: finishedAt.toISOString(),
          fetched,
          new_count: newCount,
          updated_count: updatedCount,
          failed: Math.max(failed, 1),
          error_text: message,
          duration_ms: durationMs,
        })
        .eq("id", runId);
    }
    if (sourceId) {
      await db.from("sources").update({ status: "error", last_run_at: finishedAt.toISOString() }).eq("id", sourceId);
    }
    return {
      runId,
      sourceId,
      fetched,
      newCount,
      updatedCount,
      unchanged,
      failed: Math.max(failed, 1),
      durationMs,
      windowFrom,
      windowTo,
      error: message,
    };
  }
}

type StoreOutcome = "new" | "amended" | "unchanged";

/**
 * Store one notice.
 *  - identical identity + identical hash -> unchanged (rule 2, zero duplicates)
 *  - identity known but hash changed     -> AMENDMENT: new raw document and a
 *    new opportunity version; the previous row is superseded, not overwritten.
 */
export async function storeNotice(db: Db, sourceId: string, record: Json): Promise<StoreOutcome> {
  const n = normaliseNotice(record);
  if (!n) throw new Error("Notice without publication-number");

  const hash = contentHash(record);

  const { data: existingRaw, error: rawSelErr } = await db
    .from("raw_documents")
    .select("id,hash")
    .eq("source_id", sourceId)
    .eq("native_id", n.nativeId)
    .eq("hash", hash)
    .maybeSingle();
  if (rawSelErr) throw new Error(`raw_documents lookup failed: ${rawSelErr.message}`);

  const { data: currentOpp, error: oppSelErr } = await db
    .from("opportunities")
    .select("id,version")
    .eq("source_id", sourceId)
    .eq("native_id", n.nativeId)
    .is("superseded_by", null)
    .maybeSingle();
  if (oppSelErr) throw new Error(`opportunities lookup failed: ${oppSelErr.message}`);

  // Rule 2: same identity, same content, already have the opportunity -> skip.
  if (existingRaw && currentOpp) return "unchanged";

  let rawId = (existingRaw as { id: string } | null)?.id ?? null;
  if (!rawId) {
    const { data: inserted, error: rawInsErr } = await db
      .from("raw_documents")
      .insert({
        source_id: sourceId,
        native_id: n.nativeId,
        url: n.url,
        fetched_at: new Date().toISOString(),
        hash,
        payload: record,
        lang: n.lang,
      })
      .select("id")
      .single();
    if (rawInsErr) throw new Error(`raw_documents insert failed: ${rawInsErr.message}`);
    rawId = (inserted as { id: string }).id;
  }

  const fields = {
    kind: "tender" as const,
    title: n.title,
    buyer_name: n.buyerName,
    country: n.country,
    nuts: n.nuts,
    cpv: n.cpv,
    sectors: n.sectors,
    est_value: n.estValue,
    currency: n.currency,
    published_at: n.publishedAt,
    deadline_at: n.deadlineAt,
    status: n.status,
    source_id: sourceId,
    raw_document_id: rawId,
    native_id: n.nativeId,
    updated_at: new Date().toISOString(),
  };

  if (!currentOpp) {
    const { error } = await db.from("opportunities").insert({ ...fields, version: 1 });
    if (error) throw new Error(`opportunities insert failed: ${error.message}`);
    return "new";
  }

  const prev = currentOpp as { id: string; version: number };
  // The new version is inserted already marked as superseded by the previous
  // row, so the "one current row" unique index is never violated mid-flight.
  const { data: nextRow, error: insErr } = await db
    .from("opportunities")
    .insert({ ...fields, version: prev.version + 1, superseded_by: prev.id })
    .select("id")
    .single();
  if (insErr) throw new Error(`opportunities version insert failed: ${insErr.message}`);
  const nextId = (nextRow as { id: string }).id;

  const { error: supErr } = await db
    .from("opportunities")
    .update({ superseded_by: nextId, updated_at: new Date().toISOString() })
    .eq("id", prev.id);
  if (supErr) throw new Error(`superseding previous version failed: ${supErr.message}`);

  const { error: clrErr } = await db.from("opportunities").update({ superseded_by: null }).eq("id", nextId);
  if (clrErr) throw new Error(`promoting new version failed: ${clrErr.message}`);

  return "amended";
}

export type { Admin };
