# OCTAPOD pilot — Consolidated State Report (for Claude)

**Date:** 2026-09-04
**Backend:** External Supabase project `tsaeuuldzjdmqjeltyhw` (`https://tsaeuuldzjdmqjeltyhw.supabase.co`). Lovable Cloud is NOT used anywhere.
**Stack:** TanStack Start v1 (React 19, Vite 7), Tailwind v4 tokens in `src/styles.css`. Server logic = `createServerFn` + server routes under `src/routes/api/public/*`. No Supabase Edge Functions (no deploy path from Lovable).
**Phases complete:** 0, 0B, 1. **Next:** Phase 2 — AI enrichment.

---

## 1. Phase 0B — Auth & tenancy (complete, verified)

- Migration `db/migrations/0001_phase0b_auth_tenancy.sql`, applied to the external project.
- Tables: `organizations (id, name, created_at)`, `org_members (org_id, user_id, role owner|admin|member)`.
- Signup requires an organization name; a trigger creates the org and the owner membership.
- RLS on both tables; 8 policies; membership checked via a SECURITY DEFINER helper (no recursive RLS).
- Verified: anonymous reads blocked, signup creates org + owner row, cross-org reads return 0 rows.
- **Auth gate is currently DISABLED** via `src/lib/auth-flags.ts` (`AUTH_ENABLED = false`) so the pilot can be browsed without login. Route guards, `/auth`, org queries and sign-out are all behind this flag. Flip one constant to re-enable — no other code change needed.
- 6 organizations exist (test signups from verification).

## 2. Phase 1 — TED ingestion for Finland (complete, verified)

**Source:** TED Search API v3, `POST https://api.ted.europa.eu/v3/notices/search`, unauthenticated (per the Source & Access Register). `onlyLatestVersions:false`, `paginationMode: ITERATION`, page size 250. All country scoping is data, not schema.

**Filter actually in force** (`src/lib/ted.server.ts`):
`(classification-cpv IN (45* 71* 09* 44* 51* 65*)) AND ((buyer-country IN (FIN)) OR (place-of-performance-country-lot IN (FIN))) AND (publication-date window)`.

Divisions 44 (pipes / construction materials) and 51 (installation services) were added after a read-only coverage probe. 31, 42, 48 and 72 were measured and **excluded** as noise (lighting, UPS, cleaning machinery, municipal IT). Division 51 is provisional — re-measure its relevant proportion after Phase 2 enrichment and drop it if low.

**Migrations applied:** `0002_phase1_ted_ingestion.sql`, `0003_phase1_ted_schedule.sql`, `0004_phase1_supply_flag.sql` (all idempotent).

**Tables:** `sources`, `raw_documents`, `opportunities`, `ingest_runs`, `app_settings` (service-role only). Enums `source_kind (tender|signal)`, `opportunity_kind (tender|project)`.

**RLS:** enabled on every table. Grants: `SELECT` to `authenticated`, `ALL` to `service_role` on the four data tables; `app_settings` is `service_role` only. 8 policies (read-for-authenticated + manage-for-service-role per table).

**Ingestion rules (all five implemented and exercised):** original payload stored immutably; identity `(source_id, native_id)`; SHA-256 content hash → new raw row + new opportunity version, previous row superseded (never overwritten); cursor with 7-day overlap; one `ingest_runs` row per run.

**Supply vs works/services:** `opportunities.is_supply boolean` (nullable), derived at ingestion from CPV divisions + notice type — design contests and any of 45/51/71/65 → works/services; otherwise a primary division of 09/31/42/44 → supply; no judgeable CPV → null. Surfaced as a Type column on the Opportunities screen.

**Sector labels:** `CPV_SECTORS` covers every ingested division — 44 → "pipelines and water infrastructure", 51 → "installation and mechanical works". Existing rows were re-derived from their stored raw payloads (no refetch, nothing invented). Counts: construction 835, engineering 525, pipelines/water 167, installation/mechanical 116, energy 105, utilities 33.

**Schedule:** `pg_cron` + `pg_net` installed. Job `octapod-ted-daily`, `15 4 * * *`, active — calls `trigger_ted_ingest()` which POSTs to `/api/public/ingest/ted` with `x-ingest-token` using `app_settings.ingest_base_url` / `ingest_token`.

**Live data in the database right now (all real TED notices, verified today):**

| Metric | Value |
|---|---|
| Current opportunities (`superseded_by is null`) | **1,632** |
| Raw documents | 1,632 |
| `published_at` populated | 1,632 / 1,632 |
| `deadline_at` populated | 913 |
| Status open / closed | 866 / 766 |
| Supply / works-services / undetermined | 218 / 1,403 / 11 |
| Ingest runs recorded | 4 |

**Acceptance results:** first backfill 2026-04-07→2026-09-04 fetched 1,427 (1,151 new, 276 unchanged, 0 failed). Widened re-run over the same window fetched 1,632: **205 new, 0 updated, 1,427 unchanged, 0 failed, 0 duplicate current rows** — the identity + hash rules absorbed the whole overlap. Amendment versioning proven with a controlled test that was fully reverted; sampled TED notice links resolve.


## 3. Data reality — mock data purge (done)

All fabricated content was removed from the interface. There is no mock, sample or generated data anywhere in the app.

- Dashboard is now driven by a real server query (`getDashboardSummary`) over current TED opportunities: real counts, stated EUR value, recent notices with TED links, active buyers, last ingest time.
- Removed: fake KPI cards, invented signals, map hotspots, market/competitive charts, activity feed, fake user/notification chrome.
- Signals, Map, Projects, Reports, Calendar, Competitors now show honest empty states ("no data yet — arrives in Phase N"), not placeholder rows.
- Opportunities screen lists real rows with CPV / published / deadline filters and TED links.

**Fix applied:** TED returns `publication-date` as `2026-07-01+02:00` (date + offset, no time), which `new Date()` cannot parse, so `published_at` was NULL for every row. `parseDate()` in `src/lib/ted.server.ts` now normalises that shape before parsing; real data was backfilled (see table above). No values were invented.

## 4. Open items / deviations to carry into Phase 2

1. **Ingestion runs as a TanStack server route** (`src/routes/api/public/ingest/ted.ts` + `src/lib/ted.server.ts`), not a Supabase Edge Function. Same schedule, same service-role key, token-protected endpoint.
2. **Stored raw payload is the TED Search API JSON record** (which carries the notice XML link), not fetched/parsed eForms XML. If Phase 2 extraction needs full notice text, add an eForms fetch step first.
3. **Cron reachability:** the app is not published; `app_settings.ingest_base_url` points at the preview URL and a token check there returned 401 (dev server returns 200). Re-verify `INGEST_TRIGGER_TOKEN` and repoint `ingest_base_url` once a published URL exists.
4. **`opportunity_kind`** contains `project`, which nothing produces yet — confirm whether to keep or drop.
5. **Auth disabled** (`AUTH_ENABLED=false`) — decide when to re-enable.
6. Pre-existing `Sidebar` `useContext` runtime alert to investigate separately (unrelated to ingestion).

## 5. Guardrails still in force

External Supabase only (never Lovable Cloud); RLS on every table; no secrets or AI calls in the frontend; no mock/generated data ever — failed ingestion fails visibly and is logged; country is always a data column; build strictly phase by phase.

---

**Ready for Phase 2 — AI enrichment** (structured extraction from source text only, strict JSON schema, stored with provenance, no invented fields).
