# Complete Phase 0B verification and produce the Phase 1 hand-off

Goal: confirm Phase 0B (auth + tenancy) is fully correct against your external Supabase project, fix the cosmetic hydration mismatch, and produce a clean State Report you can hand to Claude AI to generate the Phase 1 (TED ingestion) prompt.

## Current state confirmed this turn
- App backend = external Supabase project ref `tsaeuuldzjdmqjeltyhw` (verified).
- Lovable Cloud disconnected; no Lovable-Cloud references in active code/config.
- Phase 0B migration `db/migrations/0001_phase0b_auth_tenancy.sql` **is applied**: REST probes confirm tables `organizations` and `org_members` exist and return empty arrays to the anon key (RLS blocking reads, as intended). A non-existent table returns `PGRST205`, so existence is genuine.
- Auth is currently switched OFF via `AUTH_ENABLED = false` (`src/lib/auth-flags.ts`).

## Work to do (after approval)

### 1. Store the service-role key as a secret
- Request `SUPABASE_SERVICE_ROLE_KEY` via the secure secret form (you enter it; it never passes through chat).
- This also enables future Phase 1+ server-side privileged operations (ingest runs, admin tasks).

### 2. Full Phase 0B verification against the live DB (read-only)
Using the service-role key from server code (bypasses RLS for inspection only), verify:
- Enum `org_role`, tables `organizations`, `org_members` with expected columns.
- RLS is **enabled** on both tables.
- Exact policy list (membership-scoped SELECT/INSERT/UPDATE/DELETE; admin-only rename).
- Grants present (`authenticated`, `service_role`).
- Signup automation: trigger `handle_new_user` + function create org + owner row exists.
- A real test signup: create a user -> assert one `organizations` row + one `org_members` row with `role = owner`.
- Isolation test: a second org cannot read/alter the first org's rows (RLS holds as the authenticated user, not via admin).

### 3. Resolve the hydration mismatch
- Make the `_authenticated` layout render identically on server and first client paint so the `Suspense`/`AppShell` mismatch warning stops.
- Re-run the preview with Playwright; confirm a clean console (no hydration errors) on `/` and `/settings`.

### 4. Re-enable auth (kill-switch back to true)
- Set `AUTH_ENABLED = true` in `src/lib/auth-flags.ts`.
- Confirm unauthenticated visit to `/` redirects to `/auth`; valid login reaches the dashboard; top bar shows the real org name; Settings shows rename + member list.
- If you prefer to keep auth off a little longer, this step is skipped and noted in the report.

### 5. Produce the Phase 0B State Report
Write a document (e.g. `docs/state-reports/phase-0b.md`) with the 8 standard points: tables, policies (full list), grants, signup automation, RLS isolation test method + result, deviations, open items, and the confirmation that all data is real (no mock data in Phase 0B). This is what you hand to your Claude AI chat to request the Phase 1 prompt.

## Guardrails respected
- No schema changes (migration already applied). No new tables/policies. No Lovable Cloud.
- No new colours, fonts, or component restyling.
- No ingestion, AI, map data, or new feature pages — Phase 1 scope only.
- All data verification uses your real external Supabase project; no mock data introduced.
- Country stays a data field; nothing hard-coded to Finland.

## Verification
- RLS policy list printed and matches the migration.
- Real signup produces exactly one org + one owner membership; isolation test blocks cross-org access.
- Preview console shows no hydration error after the fix.
- State Report written and ready to hand off for the Phase 1 prompt.
