## Phase 0A — Frontend Foundation (OCTAPOD)

Frontend-only build. No Lovable Cloud, no Supabase, no auth, no DB, no edge functions. This phase establishes the "Baltic chart room" design language and reusable primitives that every later phase will reuse without modification.

### 1. Design tokens (single source of truth in `src/styles.css`)

Replace the default shadcn palette with the Baltic chart-room system. All tokens defined in `@theme inline` + `:root` (dark, default) + `.light` class (chart-paper mode).

**Palette — deep blue-slate base, layered**
- `--background` (dark): deep navy-slate near-black with blue cast
- `--surface-1`, `--surface-2`, `--surface-3`: layered elevations for chart-room depth
- `--foreground`, `--muted-foreground`, `--subtle-foreground`
- `--border`, `--hairline` (0.5px equivalent divider color)
- Light mode = "chart paper": warm off-white paper tone, ink-navy foreground, faint blue grid line color

**Functional accents (semantic, never decorative)**
- `--accent-tender` (ice-cyan): tenders only
- `--accent-signal` (amber): early signals only
- `--status-success`, `--status-warning`, `--status-danger`, `--status-info` — reserved but muted; used only for system states, never to compete with the two data accents

**Typography tokens**
- `--font-display`: Space Grotesk (headings, restrained)
- `--font-sans`: Inter (UI/body)
- `--font-mono`: IBM Plex Mono (numbers, IDs, coordinates, money, coords)
- Type scale + tracking values as tokens (`--text-display`, `--text-h1`…`--text-xs`, tight tracking on display, normal on body, mono uses tabular-nums)

**Other tokens**
- `--radius` scale (small, restrained — 4/6/8px, not pill-y)
- `--shadow-chart` subtle elevation used sparingly
- `--isoline-bg`: SVG data-URI contour/isoline background pattern for map-adjacent surfaces
- `--grid-bg`: faint chart-paper grid pattern for light mode

Fonts loaded via `<link>` in `src/routes/__root.tsx` head (Google Fonts: Space Grotesk, Inter, IBM Plex Mono) per Tailwind v4 rules — never `@import` in CSS.

Tokens are documented inline in `src/styles.css` with a header comment block explaining the accent contract (cyan=tender, amber=signal) and layered surfaces.

### 2. Theme toggle
- `src/lib/theme.tsx`: React context + hook, persists to `localStorage` (`octapod-theme`), applies `dark` or `light` class on `<html>`. Default: dark.
- Toggle placed in the top bar.

### 3. App shell

Routes (TanStack Router, file-based):
- `src/routes/__root.tsx` — updated head (title "OCTAPOD — Market Intelligence", description, og tags), fonts, shell layout with sidebar + top bar wrapping `<Outlet />`
- `src/routes/index.tsx` — rewrite placeholder → Dashboard empty state (root path IS the dashboard)
- `src/routes/opportunities.tsx` — Opportunities empty state
- `src/routes/signals.tsx` — Signals empty state
- `src/routes/map.tsx` — Map empty state
- `src/routes/settings.tsx` — Settings empty state

Each leaf route defines its own `head()` with unique title + description.

**Layout components** (`src/components/shell/`):
- `AppShell.tsx` — grid layout: sidebar left, top bar, main content area
- `Sidebar.tsx` — left nav using shadcn Sidebar primitive; items: Dashboard, Opportunities, Signals, Map, Settings; icons from lucide (compass, file-text, radio, map, settings-2); active state via TanStack `Link` + `useRouterState`; OCTAPOD wordmark at top; collapsible with `SidebarTrigger`
- `TopBar.tsx` — OCTAPOD wordmark on far left of top bar area, org name placeholder chip ("Organization —"), theme toggle, mono clock/status area on right
- Sidebar and top bar use hairline dividers, not shadows

### 4. Reusable components (`src/components/octapod/`)

Each component exports `.Loading`, `.Empty`, `.Error` subcomponents (or accepts a `state` prop). All built on shadcn primitives, styled with tokens only.

- **`DataTable.tsx`** — dense typographic table (Inter body, IBM Plex Mono for numeric/id/date/money columns, tabular-nums), hairline row dividers, sticky header, sortable header affordance, right-aligned mono columns; loading (skeleton rows), empty (icon + copy + optional action slot), error (message + retry).
- **`FilterBar.tsx`** — horizontal bar for filters (search input, chip filters, applied-filters row, "Save filter" action per microcopy rule); accepts children for filter controls; loading/empty/error slots.
- **`StatCard.tsx`** — label (Inter small caps tracked), value (IBM Plex Mono, large), delta/context line, optional accent stripe (cyan for tender metrics, amber for signal metrics — semantic prop `variant: "tender" | "signal" | "neutral"`); loading skeleton, empty ("—" placeholder), error state.
- **`Tag.tsx` / `Chip.tsx`** — ISO country-code chip (mono, uppercase, hairline border, no flags), sector chip, status chip; variants: `tender`, `signal`, `neutral`, `country`; sizes sm/md.
- **`EmptyState.tsx`** — centered, icon + Space Grotesk display heading (sentence case) + Inter body copy + optional action button. Used as the body of every route page in this phase.

All five components live under `src/components/octapod/` with an `index.ts` barrel. A short README in that folder documents the accent contract and when to use which variant.

### 5. Route empty states (invite the future action)

Each page renders `EmptyState` with copy that reflects Master Strategy positioning ("AI analyst watching your market", not a listing site). Sentence case, plain and active:

- **Dashboard**: "Your market, at a glance." / "Once ingestion is connected, this dashboard will show live tender activity, active signals and fit scores against your profile."
- **Opportunities**: "No opportunities yet." / "Tenders from TED and Hilma will land here. You'll filter by sector, region and value, and save the filters you use most." — includes disabled `FilterBar` + `DataTable.Empty` preview beneath to show the intended surface.
- **Signals**: "No signals yet." / "Grid plans and press announcements — the 6-to-24-month lead before a tender exists — will stream in here." Amber accent stripe.
- **Map**: "The map opens once opportunities and signals are flowing." Isoline texture visible on the empty canvas.
- **Settings**: "Set up your organization profile." / "Capabilities, sectors, target countries and project size range drive your fit scores."

### 6. File plan

**New:**
- `src/lib/theme.tsx`
- `src/components/shell/AppShell.tsx`
- `src/components/shell/Sidebar.tsx`
- `src/components/shell/TopBar.tsx`
- `src/components/shell/ThemeToggle.tsx`
- `src/components/octapod/DataTable.tsx`
- `src/components/octapod/FilterBar.tsx`
- `src/components/octapod/StatCard.tsx`
- `src/components/octapod/Tag.tsx`
- `src/components/octapod/EmptyState.tsx`
- `src/components/octapod/index.ts`
- `src/components/octapod/README.md` (token + accent contract doc)
- `src/routes/opportunities.tsx`
- `src/routes/signals.tsx`
- `src/routes/map.tsx`
- `src/routes/settings.tsx`

**Modified:**
- `src/styles.css` — full token rewrite
- `src/routes/__root.tsx` — fonts, meta, wrap Outlet in AppShell + ThemeProvider
- `src/routes/index.tsx` — replace placeholder with Dashboard empty state

### 7. What is explicitly NOT done
- No `supabase--enable`, no Lovable Cloud, no DB, no auth, no edge functions, no `/api/*` routes, no server functions, no secrets.
- No mock/sample data anywhere. Empty states are truly empty.
- No new UI libraries beyond the existing shadcn/Tailwind stack.

### 8. Final report will confirm
Pages/components/files built · explicit "no backend/DB/auth/Cloud" statement · token inventory with file locations · open questions (e.g. exact ice-cyan/amber hex values chosen, isoline texture density) · verification that dev preview renders all five routes in both dark and light modes.

### Open items I'll decide during build unless you object
- Exact hex/oklch values for ice-cyan and amber (will pick calm, desaturated values that read as instruments, not neon).
- Isoline SVG pattern density (subtle enough to be a texture, not a graphic).
- Whether the top bar clock shows UTC or local (leaning UTC + mono, matches chart-room feel).
