# OCTAPOD pilot — roadmap

Builds phase by phase (0→6). Nothing from the "Not in the pilot" list without asking.

## Status
- [x] **Phase 0 / 0B — Auth & tenancy.** Complete and verified (see `docs/state-reports/phase-0b.md`). Auth gate currently disabled (`AUTH_ENABLED=false`) for pilot browsing; flip flag to re-enable. Service-role key stored as `OCTAPOD_SERVICE_ROLE_KEY`.
- [x] **Phase 1 — TED ingestion for Finland.** Complete and verified (see `docs/state-reports/phase-1.md`).
  - [x] Migration `db/migrations/0002_phase1_ted_ingestion.sql` — applied to external project (sources, raw_documents, opportunities, ingest_runs + RLS).
  - [x] Migration `db/migrations/0003_phase1_ted_schedule.sql` — applied (pg_cron daily trigger, app_settings wired with preview URL + token).
  - [x] Ingestion (`src/lib/ted.server.ts`), cron endpoint `/api/public/ingest/ted`, admin screen `/ingestion`, real Opportunities screen.
  - [x] Backfill + acceptance: 1,427 real TED opportunities; idempotency double-run (0 new); amendment versioning (reverted test); 3 ingest_runs; 5 TED links resolve (HTTP 202).
  - Open: verify deployed `INGEST_TRIGGER_TOKEN` + set `ingest_base_url` to the published URL once published; investigate pre-existing `Sidebar` useContext runtime alert.
- [ ] **TED CPV coverage review** (in progress) — read-only probe of divisions 31, 42, 44, 48, 51, 72 for Finland; per-division counts, 10 sample titles + buyer, and count above EUR 1M. No DB writes; widen `TED_CPV_DIVISIONS` only after the user approves specific divisions.
- [ ] Phase 2 — AI enrichment (Claude extraction, strict JSON schema, source-text-only).
- [ ] Phase 3 — Map (Mapbox) + opportunity detail.
- [ ] Phase 4 — Early signals (Fingrid + news) + signal linking.
- [ ] Phase 5 — (per plan) — see `docs/pilot-phase-plan.md`.
- [ ] Phase 6 — Client profile + fit scores.

## Open decisions
- **Public-repository cleanup:** placeholder `.env.example` and local instructions are added. Ignoring and untracking the already-tracked `.env` require user action because the platform manages `.gitignore` and Git state. Preserve hosted public connection settings first; untracking does not remove earlier history.
- **Applying migrations** (resolved 2026-09-04): stay on the external Supabase project (NOT Lovable Cloud). To let the agent apply migrations directly, the user provides the Postgres connection string once as the `OCTAPOD_DB_URL` secret.
- When to re-enable auth (currently off).
- Apply Phase 1 migrations (user runs SQL manually, as for Phase 0B).
- Deviations pending confirmation: ingestion runs as a TanStack server route (project has no Supabase Edge Functions), and raw payload = TED Search API JSON rather than eForms XML.
