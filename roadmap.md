# OCTAPOD pilot — roadmap

Builds phase by phase (0→6). Nothing from the "Not in the pilot" list without asking.

## Status
- [x] **Phase 0 / 0B — Auth & tenancy.** Complete and verified (see `docs/state-reports/phase-0b.md`). Auth gate currently disabled (`AUTH_ENABLED=false`) for pilot browsing; flip flag to re-enable. Service-role key stored as `OCTAPOD_SERVICE_ROLE_KEY`.
- [~] **Phase 1 — TED ingestion for Finland.** Code complete, blocked on the user running two migrations.
  - [x] Migration `db/migrations/0002_phase1_ted_ingestion.sql` (sources, raw_documents, opportunities, ingest_runs + RLS).
  - [x] Migration `db/migrations/0003_phase1_ted_schedule.sql` (pg_cron daily trigger).
  - [x] Ingestion (`src/lib/ted.server.ts`), cron endpoint `/api/public/ingest/ted`, admin screen `/ingestion`, real Opportunities screen.
  - [ ] **User action:** run 0002 (and 0003 after setting app URL + token) in the Supabase SQL Editor.
  - [ ] After migration: backfill, acceptance tests (double-run duplicates, amendment versioning, >1000 rows, 5 TED links), Phase 1 state report.
- [ ] Phase 2 — AI enrichment (Claude extraction, strict JSON schema, source-text-only).
- [ ] Phase 3 — Map (Mapbox) + opportunity detail.
- [ ] Phase 4 — Early signals (Fingrid + news) + signal linking.
- [ ] Phase 5 — (per plan) — see `docs/pilot-phase-plan.md`.
- [ ] Phase 6 — Client profile + fit scores.

## Open decisions
- When to re-enable auth (currently off).
- Apply Phase 1 migrations (user runs SQL manually, as for Phase 0B).
- Deviations pending confirmation: ingestion runs as a TanStack server route (project has no Supabase Edge Functions), and raw payload = TED Search API JSON rather than eForms XML.
