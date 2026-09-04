# OCTAPOD pilot — roadmap

Builds phase by phase (0→6). Nothing from the "Not in the pilot" list without asking.

## Status
- [x] **Phase 0 / 0B — Auth & tenancy.** Complete and verified (see `docs/state-reports/phase-0b.md`). Auth gate currently disabled (`AUTH_ENABLED=false`) for pilot browsing; flip flag to re-enable. Service-role key stored as `OCTAPOD_SERVICE_ROLE_KEY`.
- [ ] **Phase 1 — TED ingestion for Finland.** Next. Pending: hand the Phase 0B state report to Claude to generate the Phase 1 prompt. Adds real data pipeline (sources, raw_documents, opportunities, ingest_runs), no mock data.
- [ ] Phase 2 — AI enrichment (Claude extraction, strict JSON schema, source-text-only).
- [ ] Phase 3 — Map (Mapbox) + opportunity detail.
- [ ] Phase 4 — Early signals (Fingrid + news) + signal linking.
- [ ] Phase 5 — (per plan) — see `docs/pilot-phase-plan.md`.
- [ ] Phase 6 — Client profile + fit scores.

## Open decisions
- When to re-enable auth (currently off).
- Apply Phase 1 migration (user runs SQL manually, as for Phase 0B).
