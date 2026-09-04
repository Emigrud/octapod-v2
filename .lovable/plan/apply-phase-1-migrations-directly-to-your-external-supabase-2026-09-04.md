# Apply Phase 1 migrations directly to your external Supabase project

Decision recorded: **stay on the external project `tsaeuuldzjdmqjeltyhw`** — no Lovable Cloud. (Approved 2026-09-04; re-shown to resume at the secret step.)

## Step 1 — you store the Postgres connection string once (secure form)

Supabase dashboard → Project Settings → Database → Connection string → URI, e.g.
`postgresql://postgres.tsaeuuldzjdmqjeltyhw:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres`.

Paste the **whole string, password included**, into the `OCTAPOD_DB_URL` secure form. Best practice: copy the URI string Supabase shows you verbatim — it already has any special characters in the password correctly percent-encoded. Don't paste the password into chat.

## Step 2 — I apply the migrations (idempotent)

- `db/migrations/0002_phase1_ted_ingestion.sql` — creates `sources`, `raw_documents`, `opportunities`, `ingest_runs`; the `source_kind` / `opportunity_kind` enums; indexes; 8 RLS policies (authenticated SELECT, service_role ALL) + grants; TED seed row.
- `db/migrations/0003_phase1_ted_schedule.sql` — pg_cron + pg_net daily job (04:15 UTC). I will write your app URL and the `INGEST_TRIGGER_TOKEN` value into `app_settings` so the cron job is fully wired.

## Step 3 — backfill + acceptance tests (real numbers)

1. Run a backfill (multi-month window) and report the exact record count loaded.
2. Run the fetch **twice**; second run must add **zero** new rows — show both runs' fetched/new/updated counts.
3. Demonstrate amendment detection: a changed notice becomes version 2 with the previous row superseded, not overwritten.
4. Confirm `ingest_runs` shows fetched / new / updated / failed per run.
5. Load Opportunities over **1000+ rows**, confirm responsive.
6. Open **five** TED links from real rows, confirm they resolve.

## Step 4 — state report + roadmap

Write `docs/state-reports/phase-1.md` in the Phase 0B structure and update `roadmap.md`.

## Deviations to confirm (carried)

1. Ingestion runs as a TanStack server route, not a Supabase Edge Function — this project has no edge-function deployment path from Lovable. Same schedule, same service-role key, endpoint token-protected.
2. The stored raw payload is the TED Search API JSON record (carries the notice XML link), not the fetched eForms XML document. Full eForms fetch/parse can follow before enrichment if you want it.
