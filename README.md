# OCTAPOD v2

The product is called OCTAPOD. Read the attached Master Strategy Document (Pilot) fully before starting.

This is PHASE 0A — frontend only. Build NO backend, NO database, NO authentication, NO tables, NO edge functions. Do not enable Lovable Cloud. We will connect our own Supabase project before any backend work begins.

Build the design system and the application shell.

DESIGN LANGUAGE — follow Master Strategy section 9, "Baltic chart room": the visual world of nautical charts, grid control rooms and engineering drawings. Calm Northern precision carrying dense, live data. Explicitly avoid default AI-SaaS looks: no purple gradients, no cream-and-terracotta landing template, no pure-black theme with a single acid accent, no stock illustrations.

- Dark theme by default, plus a light "chart paper" mode with a toggle.

- Space Grotesk for display headings, used with restraint. Inter for UI and body. IBM Plex Mono for numbers, IDs, coordinates and money.

- Layered deep blue-slate base palette. Exactly two functional accents used consistently to encode meaning: ice-cyan for tenders, amber for early signals. Colour is information, never decoration.

- Subtle isoline or contour texture on map-adjacent surfaces. Hairline dividers, used sparingly. ISO country-code chips, never flags.

- Strong typographic hierarchy, sentence case.

- Microcopy: plain, active, specific. "Save filter", not "Submit". Errors say what happened and how to fix it.

APP SHELL:

- Left navigation: Dashboard, Opportunities, Signals, Map, Settings.

- Top bar with the product name and a placeholder area for the organization name.

- Every page is a styled empty state for now, written so it invites the action that will exist later.

REUSABLE COMPONENTS — these will be used in every later phase, so build them properly now:

DataTable, FilterBar, StatCard, Tag/Chip, EmptyState. Each must have loading, empty and error states.

Document all design tokens in code so later phases reuse them instead of inventing new styles.

WHEN FINISHED, report:

1. What you built — pages, components, files.

2. Confirm explicitly that no database, no authentication, no backend and no Lovable Cloud project was created.

3. The design tokens you defined and where they live in the code.

4. Anything you were unsure about.

5. Make design look modern, expensive and professional.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8decc1be-879f-4382-ba74-d42cf7bb1c09).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

### Environment configuration and public-repository safety

Copy `.env.example` to `.env` and replace the public placeholders with your
own external project's connection settings. Configure the three private
credentials in your hosting provider's secure environment settings (or an
ignored local `.env` for development). Never use a `VITE_` prefix for a
database password, service-role key, or ingestion trigger token.

**Cleanup status:** `.env` is still tracked. Lovable manages `.gitignore`
and does not permit the agent to edit it or change Git tracking. Before
making the repository public, add these lines to `.gitignore` yourself
in your local checkout:

```gitignore
.env
.env.*
*.env
!.env.example
```

Ignoring a file does **not** remove it from Git if it is already tracked.
Then run these commands in your local checkout:

```sh
git rm --cached .env
git add .gitignore .env.example
git commit -m "Stop tracking local environment settings"
git push
```

This keeps your local `.env` while removing it from subsequent commits.
Earlier commits still contain previously committed values. A publishable key
is intentionally public; if any private credential was ever committed,
rotate it and arrange history cleanup before sharing the repository.
Ensure the hosting environment still supplies all six public connection
settings before publishing; an ignored local file is not deployed through Git.
Lovable currently reserves the `SUPABASE_` and `VITE_` prefixes in its
user-created secret form, so that form cannot replace this project's `.env`.
Do not remove the hosted connection settings until a replacement is configured
and the dashboard has been checked.

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
