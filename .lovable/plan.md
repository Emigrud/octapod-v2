# Temporarily deactivate the sign-in gate

Goal: open the dashboard directly without authentication during early pilot exploration. Auth (Phase 0B) stays in the codebase and can be re-enabled by flipping one switch.

## Changes

1. **Single kill-switch constant**
   - Add `AUTH_ENABLED = false` in one shared module (e.g. `src/lib/auth-flags.ts`).
   - Re-enabling later = set it back to `true`. No other code changes needed.

2. **`src/routes/_authenticated/route.tsx`**
   - When `AUTH_ENABLED` is false: skip the `supabase.auth.getUser()` check and do not redirect to `/auth`; render the app shell directly.
   - When true: current behaviour unchanged.

3. **`src/routes/auth.tsx`**
   - When `AUTH_ENABLED` is false: visiting `/auth` redirects straight to `/` (so no dead-end page).
   - Keep the full sign-in/sign-up code untouched for reactivation.

4. **Top Bar (`src/components/shell/TopBar.tsx`)**
   - While auth is off there is no session, so `useOrg()` returns nothing: show a neutral fallback label (e.g. "OCTAPOD — pilot preview") instead of a broken/empty org name, and hide the sign-out button.
   - When auth is re-enabled, the real organization name and sign-out return automatically.

5. **Settings (`src/routes/_authenticated/settings.tsx`)**
   - While auth is off: the organization card (rename form, member list) shows a short "Sign-in is temporarily disabled — organization management will appear here when re-enabled" note instead of empty/loading states.
   - All other Settings content and all other pages keep their current display data untouched.

6. **Fix the `/auth` hydration mismatch** (visible in preview errors)
   - The `/auth` route is `ssr: false` but still renders a server shell that mismatches; make the auth page render client-only cleanly so no hydration error appears once the gate returns.

## Guardrails respected

- No database changes, no new tables/policies, no Lovable Cloud.
- No new colors, fonts, or styles — reuse existing tokens/components only.
- No ingestion, AI, map, or new pages.
- Nothing deleted: Phase 0B auth is switched off, not removed.

## Verification

- Preview opens `/` directly to the dashboard with no redirect to `/auth`.
- `/auth` redirects to `/` while disabled.
- No hydration errors in preview console.
- Typecheck passes.
