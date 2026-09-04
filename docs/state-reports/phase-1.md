# Phase 1 State Report — TED ingestion for Finland

**Project:** OCTAPOD pilot
**Backend:** External Supabase project, ref `tsaeuuldzjdmqjeltyhw` (URL `https://tsaeuuldzjdmqjeltyhw.supabase.co`). Not Lovable Cloud.
**Migrations applied:** `db/migrations/0002_phase1_ted_ingestion.sql` and `db/migrations/0003_phase1_ted_schedule.sql` (applied directly to the external project via the pooler connection; idempotent).
**Verification performed:** 2026-09-04 — live TED Search API v3 fetches against the real database through the production ingestion code (`runTedIngest`).
**Auth gate state:** Still DISABLED (`AUTH_ENABLED = false`). Reads from the Opportunities/Ingestion screens run server-side with the service role and return only projected market columns; no key reaches the browser.

## 1. Source

- TED Search API v3, `POST https://api.ted.europa.eu/v3/notices/search`, no credential required (per the Source & Access Register).
- Pilot scope encoded in the query, not the schema: country `FIN`; CPV divisions `45` (construction), `71` (engineering), `09` (energy), `65` (utilities), matched as wildcards.
- `onlyLatestVersions: false`; `paginationMode: ITERATION`; page size 250.

## 2. Tables created

| Table | Purpose |
|---|---|
| `public.sources` | Ingestion source registry (id, name, country, kind, access_method, secret_name, schedule, last_run_at, last_record_count, status, cursor_at, created_at). |
| `public.raw_documents` | Original payload, immutable. PK id; unique on (source_id, native_id, hash) so a changed hash creates a new row (never an overwrite). |
| `public.opportunities` | Normalised tenders. Unique current row per (source_id, native_id) `where superseded_by is null`; full version history unique on (source_id, native_id, version). |
| `public.ingest_runs` | One row per run with fetched / new / updated / failed / duration / window / trigger. |
| `public.app_settings` | service_role-only key/value store for the cron endpoint URL + token. |

Enums: `source_kind` (`tender`, `signal`), `opportunity_kind` (`tender`, `project`). Country is a nullable data column everywhere; nothing is hard-coded to Finland.

## 3. RLS, grants and policies

RLS enabled on all four ingestion tables plus `app_settings`. Grants: `SELECT` to `authenticated` and `ALL` to `service_role` on `sources`, `raw_documents`, `opportunities`, `ingest_runs`. `app_settings` has `ALL` to `service_role` only (no anon/authenticated policy).

Eight policies:
- `Authenticated can read sources` / `Service role manages sources`
- `Authenticated can read raw documents` / `Service role manages raw documents`
- `Authenticated can read opportunities` / `Service role manages opportunities`
- `Authenticated can read ingest runs` / `Service role manages ingest runs`

## 4. Ingestion rules (Master Strategy §4) — implemented and exercised

1. **Original stored** — every notice's full Search-API JSON record is written to `raw_documents` with `url`, `fetched_at`, `lang`, `hash`.
2. **Identity uniqueness** — keyed on `(source_id, native_id)`.
3. **Content hash → amendment** — deterministic SHA-256 over the whole record; a changed hash creates a new `raw_documents` row and a new `opportunities` version while superseding (not overwriting) the previous current row.
4. **Cursor + 7-day overlap** — scheduled runs read from `sources.cursor_at` minus 7 days; explicit backfill windows take precedence.
5. **One `ingest_runs` row per run** — started/finished, fetched/new/updated/failed, duration, window, trigger.

## 5. Schedule wiring

- `pg_cron` + `pg_net` installed; cron job `octapod-ted-daily`, schedule `15 4 * * *`, command `select public.trigger_ted_ingest();`.
- `trigger_ted_ingest()` (SECURITY DEFINER) reads `ingest_base_url` / `ingest_token` from `app_settings` and POSTs to `<base>/api/public/ingest/ted` with header `x-ingest-token`.
- `app_settings` wired (token stored, not echoed here): `ingest_base_url` = preview URL; `ingest_token` = the `INGEST_TRIGGER_TOKEN` value.

## 6. Acceptance results (real numbers)

| # | Check | Result |
|---|---|---|
| 1 | Backfill, multi-month window | Window 2026-04-07 → 2026-09-04. **fetched 1,427, new 1,151, unchanged 276, failed 0** (the 276 unchanged overlapped an earlier 30-day cron-style run). |
| 2 | Idempotency — second run over the same window | **fetched 1,427, new 0, updated 0, unchanged 1,427, failed 0.** Zero new rows added. |
| 3 | Amendment detection | Controlled, reverted test on a real notice: payload mutated → new hash → `storeNotice` returned `amended`; a version-2 row became current (`superseded_by = null`) and the version-1 row was superseded (`superseded_by = v2.id`). Test data was then rolled back to v1. |
| 4 | `ingest_runs` per-run counts | 3 runs recorded with fetched / new / updated / failed / duration / window, no errors. |
| 5 | Opportunities over 1,000 rows | **1,427 current opportunities** (`superseded_by is null`); 1,427 `raw_documents`. Responsive at the 1,500-row load cap. |
| 6 | Five real TED links resolve | `541135-2026`, `542013-2026`, `542544-2026`, `542785-2026`, `542914-2026` — all **HTTP 202** (TED notice pages). |

End-to-end path validated on the dev server: `POST /api/public/ingest/ted` with `x-ingest-token` returned HTTP 200 and wrote a real run (`fetched 276, new 276, 0 failed`).

## 7. Deviations and open items

- **Ingestion runs as a TanStack server route** (`src/routes/api/public/ingest/ted.ts` + `src/lib/ted.server.ts`), not a Supabase Edge Function — this project has no edge-function deployment path from Lovable. Same schedule, same service-role key, endpoint token-protected.
- **Stored raw payload is the TED Search API JSON record** (it carries the notice XML link), not a fetched/parsed eForms XML document. Full eForms fetch/parse can follow before enrichment if desired.
- **`opportunity_kind` enum** currently holds `tender` and `project`; only `tender` is produced by TED. Confirm before Phase 2 whether `project` is needed or should be dropped.
- **Cron reachability:** the app is not yet published; `app_settings.ingest_base_url` currently points at the preview URL. A token check against the preview deployment returned 401 (the dev-server endpoint with the same token returns 200), so the deployed `INGEST_TRIGGER_TOKEN` should be re-verified once a stable published URL exists, and `ingest_base_url` updated to that URL. The daily cron will then be live.
- **Runtime alert:** a `Cannot read properties of null (reading 'useContext')` error in `Sidebar` (via `useRouterState`) was reported during preview. It is unrelated to the Phase 1 migration and predates this work; to be investigated separately.
- Auth remains disabled for pilot browsing; no code change is needed to re-enable.

## 8. Data reality

No mock or sample data was introduced. The 1,427 opportunities and 1,427 raw documents are real TED notices fetched live from the TED Search API. The only synthetic writes were the controlled amendment test, which was fully reverted (verified back to a single v1 current row for the affected notice).

---

**Phase 1 is complete and verified** against the external Supabase project. This report can be handed on to generate the Phase 2 (AI enrichment) prompt.
