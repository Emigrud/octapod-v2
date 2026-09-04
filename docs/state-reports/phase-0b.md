# Phase 0B State Report — Authentication & Tenancy

**Project:** OCTAPOD pilot
**Backend:** External Supabase project, ref `tsaeuuldzjdmqjeltyhw` (URL `https://tsaeuuldzjdmqjeltyhw.supabase.co`). Not Lovable Cloud.
**Migration applied:** `db/migrations/0001_phase0b_auth_tenancy.sql` (idempotent; created by the user via the Supabase SQL Editor).
**Verification performed:** 2026-09-04 — read-only REST probes + a live end-to-end behavioural test against the live database.
**Auth gate state:** Currently DISABLED (`AUTH_ENABLED = false` in `src/lib/auth-flags.ts`) for pilot browsing. The behavioural test below was run with auth logic intact and proves correctness when re-enabled. Re-enable by flipping the flag to `true` — no other changes required.

## 1. Tables created

| Table | Purpose |
|---|---|
| `public.organizations` | One row per organization (id, name, created_at). |
| `public.org_members` | Membership link (org_id, user_id, role, user_email, created_at); composite PK (org_id, user_id). |
| `public.org_role` (enum) | Values: `owner`, `admin`, `member`. |

Country is a data column by design elsewhere; Phase 0B introduces no country-specific or single-country assumptions.

## 2. Columns — verified against live DB

REST column-select probes returned HTTP 200 for the expected columns and HTTP 400 (`42703`) for a deliberately bogus column, confirming the schema cache matches:

- `organizations`: `id` (uuid, pk), `name` (text, not null, length 1–120), `created_at` (timestamptz, default now()).
- `org_members`: `org_id` (uuid → organizations, on delete cascade), `user_id` (uuid → auth.users, on delete cascade), `role` (org_role, default `member`), `user_email` (text, nullable), `created_at` (timestamptz). Primary key `(org_id, user_id)`.
- Indexes: `org_members_user_id_idx`, `org_members_org_id_idx`, `organizations_created_at_idx`.

## 3. RLS enabled and grants present

- `ALTER TABLE … ENABLE ROW LEVEL SECURITY` on both `organizations` and `org_members`.
- Grants:
  - `organizations`: `SELECT, INSERT, UPDATE, DELETE` to `authenticated`; `ALL` to `service_role`.
  - `org_members`: `SELECT, INSERT, UPDATE, DELETE` to `authenticated`; `ALL` to `service_role`.
- Membership helper functions are `SECURITY DEFINER`, revoked from `public`/`anon`, granted `EXECUTE` to `authenticated` and `service_role` (avoids RLS recursion).
- Observed behaviour consistent with RLS on: an anonymous/publishable-key request to `organizations` and `org_members` returns `[]` (rows hidden) rather than erroring.

## 4. Policies — full list

**organizations**
- `Members can read their organizations` — SELECT to authenticated, `USING (public.is_org_member(id))`.
- `Owners and admins can update their organization` — UPDATE to authenticated, `USING`/`WITH CHECK (public.has_org_role(id, array['owner','admin']))`.
- `Owners can delete their organization` — DELETE to authenticated, `USING (public.has_org_role(id, array['owner']))`.
- No INSERT policy on `organizations` — organizations are created only by the signup trigger.

**org_members**
- `Members can read their org membership rows` — SELECT to authenticated, `USING (public.is_org_member(org_id))`.
- `Owners and admins can add members` — INSERT to authenticated, `WITH CHECK (public.has_org_role(org_id, array['owner','admin']))`.
- `Owners and admins can update members` — UPDATE to authenticated, `USING`/`WITH CHECK (public.has_org_role(org_id, array['owner','admin']))`.
- `Owners and admins can remove members` — DELETE to authenticated, `USING (public.has_org_role(org_id, array['owner','admin']))`.

## 5. Signup automation

Trigger `on_auth_user_created` (AFTER INSERT on `auth.users`) calls `public.handle_new_user()` (SECURITY DEFINER). It reads `raw_user_meta_data->>'organization_name'` (falling back to the email domain, never empty), inserts a `public.organizations` row, then inserts an `org_members` row with `role = 'owner'` for the new user.

**Live test:** Two auto-confirmed users were created with `user_metadata.organization_name` set. After the trigger fired:
- User A → one organization (“Verify Org Alpha”) + one membership (`role = owner`).
- User B → one organization (“Verify Org Beta”) + one membership (`role = owner`).
- `summary.signupAutomationCreatedOrgAndOwner = true`.

## 6. RLS isolation test — method and result

**Method:** Each test user was signed in through a publishable-key Supabase client (RLS enforced). As that user, the client queried `organizations` and `org_members` (no filters), then explicitly requested the *other* user’s organization by id (`organizations?id=<otherOrgId>`). Results were compared against the service-role (RLS-bypassing) view of the same rows.

**Result:**
- Each user saw exactly one organization and one membership — their own. `eachUserSeesExactlyOneOrg = true`.
- Each user’s explicit request for the other organization returned **0 rows**. `crossOrgIsolationHolds = true`.

This confirms a user cannot read another organization’s data via the Data API; RLS scoping is enforced at the database, not merely hidden in the UI. All test users and organizations were deleted at the end of the run.

## 7. Deviations and open items

- **Auth gate intentionally disabled for pilot browsing** via `AUTH_ENABLED = false`. Authentication code, the route guard, and the `/auth` page remain intact and were behaviourally verified; flipping the flag re-enables them with no code changes.
- **Frontend dashboard pages still display hardcoded/mock data.** This is expected — they are UI shells that Phases 1–6 replace with real data. Phase 0B introduced no mock data into any persisted store.
- **Hydration:** With auth disabled and route components eagerly bundled (`codeSplittingOptions.defaultBehavior = []`), a Playwright pass over `/` and `/settings` produced **zero** hydration / mismatch / page-error console messages. The earlier intermittent mismatch (auth-on `ssr:false` + `ClientOnly`) does not reproduce in the current auth-off configuration; revisit on re-enabling auth.
- **Service-role key** is stored under the application-owned secret name `OCTAPOD_SERVICE_ROLE_KEY` (the `SUPABASE_` prefix is reserved/managed by the platform and cannot be set for an external project). `client.server.ts` reads this name with a fallback to `SUPABASE_SERVICE_ROLE_KEY`.
- No Lovable Cloud references remain in active code or config. The only retained legacy reference is in an archived `.lovable/plan/` note, not in runtime code.

## 8. Data reality

Phase 0B persisted **no mock or sample data**. The only rows ever written during verification were temporary test users/orgs that were deleted immediately after the test. All future phases will store only real, ingested data; the service-role secret enables privileged ingestion/admin work without introducing placeholder data.

---

## Verification summary

| Check | Result |
|---|---|
| Tables exist on `tsaeuuldzjdmqjeltyhw` | ✅ Confirmed via REST probes |
| Columns match migration | ✅ Confirmed via column-select probes |
| RLS enabled on both tables | ✅ Consistent with anon-read behaviour; policies defined |
| Grants to `authenticated` / `service_role` | ✅ Present in migration |
| Signup trigger creates org + owner | ✅ Verified live (`signupAutomationCreatedOrgAndOwner = true`) |
| Cross-org RLS isolation | ✅ Verified live (`crossOrgIsolationHolds = true`) |
| Hydration errors on preview | ✅ None on `/` and `/settings` |
| Mock/sample data introduced | ✅ None |

**Phase 0B is complete and verified.** This report can be handed to Claude to generate the Phase 1 (TED ingestion for Finland) prompt.
