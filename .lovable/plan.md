# Connect external Supabase project

## Goal
Point the Lovable-hosted app at your own external Supabase database and verify the connection works.

## Current state
- Lovable Cloud is disconnected (confirmed by you).
- The app has no backend schema or data: zero tables, zero migrations, zero RLS policies.
- The Supabase integration files (`src/integrations/supabase/client.ts`, `client.server.ts`, `auth-middleware.ts`, `auth-attacher.ts`) are generic and only need the correct environment variables to work with your external project.
- `src/lib/data-source.functions.ts` already reads `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` to detect the data source mode, and the Settings page already shows the status panel.

## Steps

1. **Collect your external Supabase credentials**
   - Project URL: `https://<project-ref>.supabase.co`
   - Public (anon) key: starts with `eyJ…` (or `sb_publishable_…` for newer projects)
   - Service role key: starts with `eyJ…` (or `sb_secret_…` for newer projects)

2. **Store credentials as project secrets**
   - I will use the secure secrets form to set:
     - `SUPABASE_URL`
     - `SUPABASE_PUBLISHABLE_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - These are server/runtime secrets; they are not written to `.env`.

3. **Update client-visible variables**
   - The browser client also needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
   - I will set these as runtime secrets as well; the build will inject them where needed.

4. **Verify the swap**
   - Rebuild the app and confirm the dev server starts without missing-variable errors.
   - Open `/settings` and confirm the **Data source** panel shows:
     - Mode: **External Supabase**
     - Lovable Cloud: **Disconnected**
     - Supabase credentials: **Configured**
     - Connected project ref/host matching your external project.

5. **Decide on schema**
   - Because the app currently has no tables, no migration is required to make the swap.
   - Once connected, you can decide whether to add tables (e.g., profile, opportunities, signals) in a separate follow-up.

## What I need from you

Please provide your external Supabase credentials so I can store them securely:

- Project URL
- Public (anon) key
- Service role key

You can paste them in the next message or I can open the secure secrets form.
