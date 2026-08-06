# Credential swap to your external Supabase project

## Scope
Repoint the app at your own Supabase project. No tables, no policies, no auth, no seed data.

## What I verified
- `.env` and `supabase/config.toml` both still carry the old ref `jjclkucycmaxfyicprsd`.
- Other mentions of "Lovable Cloud" are only wording in generated integration files and the Settings status panel — not credentials.
- No migrations, no tables, no RLS policies exist in the project.

## Steps

1. **Collect credentials** (needed from you)
   - Project URL: `https://<your-ref>.supabase.co`
   - Publishable / anon key (`sb_publishable_…` or `eyJ…`)
   - Service role key (`sb_secret_…` or `eyJ…`) — only if you want server-side privileged calls; optional for now.

2. **Swap config**
   - `.env`: set `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PROJECT_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` to your project's values.
   - `supabase/config.toml`: `project_id = "<your-ref>"`.
   - Store the service role key (if provided) through the secure secrets form, not in `.env`.

3. **Regenerate types**
   - Rewrite `src/integrations/supabase/types.ts` as an empty-but-valid `Database` type for your project. It will contain no tables, which is expected.

4. **Clean up stale wording**
   - Replace the "Connect Supabase in Lovable Cloud" error strings in `client.ts` / `client.server.ts` / `auth-middleware.ts` with neutral wording.
   - Simplify the Settings **Data source** panel to report `External Supabase` plus the connected project ref, dropping the Lovable Cloud mode branch in `src/lib/data-source.functions.ts`.

5. **Verify and report back**
   - Restart the dev server and confirm no missing-variable errors.
   - Load `/settings` and read back the connected project ref.
   - Confirm: which ref the app points to, that no Lovable Cloud reference remains in code or config, and that any future migration runs against your project (the CLI reads `supabase/config.toml`'s `project_id`).

## Note
Disconnecting Lovable Cloud in the UI is a separate, admin-only action. If it is still connected, its managed environment values can override what I write into `.env`. If the verification in step 5 shows the old ref, that is the cause.

## What I need from you
Your project URL and publishable key (and service role key if you want it stored). I will open the secure secrets form rather than have you paste the service role key in chat.
