# Applying the Phase 1 migrations to your Supabase project

## Why I can't just "go in and do it"

What I actually hold for your project (`tsaeuuldzjdmqjeltyhw`) is two **API keys**:
the publishable key and the service-role key (`OCTAPOD_SERVICE_ROLE_KEY`). Those talk
to Supabase's REST API, which reads and writes **rows** in tables that already exist.

Creating tables, enums, indexes, policies and cron jobs is DDL — that only runs over a
real Postgres connection, which needs the database host **and the database password**.
Lovable never received that password, because this is your own external project rather
than a Lovable-managed one, and it cannot be derived from the project ref or from the
service-role key. That is why the `sources` / `raw_documents` / `opportunities` /
`ingest_runs` probes came back `PGRST205 — table not found`: not a permission problem,
the tables genuinely don't exist yet.

So there are exactly two ways forward.

## Option A — you paste the SQL (no credentials shared, ~1 minute)

1. Open `db/migrations/0002_phase1_ted_ingestion.sql`, copy the file **contents**.
2. Supabase dashboard → SQL Editor → new query → paste → Run.
3. Tell me it's done.

Then I take over: run the TED backfill, run the acceptance tests, write the state report.

## Option B — you give me the database connection string once

Supabase dashboard → Project Settings → Database → Connection string → URI
(it looks like `postgresql://postgres.tsaeuuldzjdmqjeltyhw:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres`).
You paste it into a secure secret form as `OCTAPOD_DB_URL`; the value goes straight to the
encrypted store and never appears in chat.

With that I can do everything myself, from here on, for this and every later phase:
apply migrations, verify policies, and run the acceptance queries directly.

## What I do once either option is done

1. Apply / confirm migration `0002` (4 tables, 8 RLS policies, grants, TED seed row).
2. Backfill Finnish TED notices for the pilot CPV divisions and report the exact record count.
3. Acceptance tests with real numbers:
   - run the fetch twice, show both runs' fetched / new / updated counts (second run must add zero new rows);
   - demonstrate amendment detection: a changed notice becomes version 2 with the previous row superseded, not overwritten;
   - confirm `ingest_runs` shows fetched / new / updated / failed per run;
   - load the Opportunities screen over 1000+ rows and confirm it stays responsive;
   - open five TED links from real rows and confirm they resolve.
4. Migration `0003` for the daily pg_cron job — needs your app URL and the
   `INGEST_TRIGGER_TOKEN` value written into `app_settings`; I'll walk that through after step 3.
5. Write `docs/state-reports/phase-1.md` in the Phase 0B structure and update `roadmap.md`
   (adding this "who applies migrations" decision as a standing item).

## Recommendation

Option B, once, if you're comfortable storing the connection string — it removes this
hand-off from every future phase. Option A is fine if you'd rather keep database
credentials entirely on your side; it just means one paste per migration.
