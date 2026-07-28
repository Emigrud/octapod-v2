
## Dashboard overhaul (frontend only, no backend)

Match the uploaded reference as closely as possible while keeping OCTAPOD's Baltic chart-room design tokens. Everything is placeholder UI — the AI Briefing panel is styled but wired later to the Claude API, the map area is a chart-textured placeholder awaiting Mapbox, and all data is static.

Scope: only `src/routes/index.tsx` (rewrite) plus a small set of new dashboard-only components. No new routes, no shell/sidebar/topbar changes beyond what's needed to host the new dashboard. No backend, no DB, no auth, no Cloud, no secrets.

### Layout (three rows)

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Page header + "Customize dashboard" ghost button                         │
├────────┬────────┬────────┬────────┬─────────────────────────────────────┤
│ KPI 1  │ KPI 2  │ KPI 3  │ KPI 4  │ KPI 5                                │  (row 1: 5 StatCards with sparkline)
├────────┴────────┼────────┴────────┴───────────────────────┬──────────────┤
│                 │                                          │              │
│  Market         │   AI Situational Awareness Briefing      │  Early       │  (row 2: 3-col
│  Overview       │   (highlighted, ring-tender accent)      │  Signals     │   ~ 3fr / 5fr / 3fr)
│  (map          │   - Summary paragraph                     │  Feed        │
│   placeholder) │   - Key Developments list                 │              │
│                 │   - Recommended Actions list             │              │
│                 │   - Risk / Priority / Confidence chips   │              │
├─────────────────┼──────────────┬──────────────┬────────────┴──────────────┤
│ Top             │ Recent       │ Market       │ Your Competitive Edge     │  (row 3: 4 equal panels)
│ Opportunities   │ Activity     │ Intelligence │ (big "412 days" figure)   │
└─────────────────┴──────────────┴──────────────┴───────────────────────────┘
```

### Row 1 — KPI strip (5 cards)

Extend `StatCard` (or add a small `KpiCard` variant next to it) to support:
- large IBM Plex Mono numeric value
- delta line ("↑ 8 vs yesterday")
- inline SVG sparkline on the right, tender-cyan stroke
- optional trailing accent icon in a hairline-square

Five cards with placeholder values matching the mock: Early Signals `24`, High-Fit Opportunities `6`, Total Project Value `€ 8.7B`, Projects 6–24 Months Out `37`, Countries Covered `8`. The fifth swaps its sparkline for a tiny Nordic map glyph (static SVG).

### Row 2 — three panels

**Market Overview (left, ~3fr)** — new `MapPlaceholder` component:
- surface-1 card, `bg-isoline` + `bg-chart-grid`
- static inline SVG of the Nordic + Baltic outline with numbered circular badges (12, 9, 8, 7, 5, 4) as data-density hotspots (tender-cyan tinted)
- "View map" ghost link header action
- `FilterBar` shrunk to one "All sectors" select + a legend row (High activity / Active / Emerging) with hairline dots
- Country-flag row at bottom → replaced with `CountryChip` row (`FIN SWE NOR DNK EST LVA LTU POL`) per our "ISO chips, never flags" rule

**AI Situational Awareness Briefing (center, ~5fr)** — new `BriefingCard`:
- Prominent card with `ring-1 ring-tender/40` + tender-cyan-tinted header row
- Header: sparkle icon + title, "Updated 9:15 AM" mono timestamp, refresh icon button
- Body: summary paragraph
- Two-column grid: `Key Developments` (4 items, each with icon, title, meta line, chevron) and `Recommended Actions` (3 items with check-circle icons)
- Footer strip: Risk / Priority / Confidence three-up with colored dots + "Briefing settings" ghost button + "View full briefing" link
- Copy in the mock is used verbatim as placeholder content; a `TODO: wired to Claude API in phase 0B` comment marks the summary+lists slots
- Semantic note: this is a system panel, so it uses the tender-cyan accent (highlights active analysis), matching the mock's blue treatment

**Early Signals Feed (right, ~3fr)** — new `SignalsFeed`:
- Header: title + "View all", tabbed chip row (All 24 / Power Grid 9 / Wind 7 / More) using `Tag`
- List of 5 signal rows: square hairline icon tile (signal-amber tint for the "New" pill), title, meta line (country · sector · impact · time-out), amber `Tag` for "New" where present
- Bottom "Go to Early Signals →" link

### Row 3 — four equal panels

- **Top Opportunities for You** — three rows with a big mono fit-score square (92 / 88 / 85), title, sector · country · value meta, right-aligned status chip and deadline. "Explore all opportunities →" footer.
- **Recent Activity** — four rows with hairline icon square, title, meta line, right-aligned mono relative time. Footer note "All data is sourced from official public registries and publications."
- **Market Intelligence** — small card with report title, 3-line summary, a static SVG line-chart placeholder, "High Confidence" `Tag`, page-dot indicator.
- **Your Competitive Edge** — big number `412 days` in tender-cyan display font, subline "Average lead start on projects before tender publication vs market average: 61 days", static SVG dual-line chart (You vs Market Avg.) with legend, "How we calculate this →" link.

### New files

- `src/components/dashboard/KpiCard.tsx` — sparkline-enabled stat card
- `src/components/dashboard/BriefingCard.tsx` — AI briefing panel (Claude placeholder)
- `src/components/dashboard/MapPlaceholder.tsx` — Nordic SVG + isoline placeholder awaiting Mapbox
- `src/components/dashboard/SignalsFeed.tsx` — right-hand signals list
- `src/components/dashboard/TopOpportunities.tsx`
- `src/components/dashboard/RecentActivity.tsx`
- `src/components/dashboard/MarketIntelligence.tsx`
- `src/components/dashboard/CompetitiveEdge.tsx`
- `src/components/dashboard/Sparkline.tsx` — tiny reusable SVG sparkline
- `src/components/dashboard/index.ts` — barrel

### Modified files

- `src/routes/index.tsx` — rewrite as the composed dashboard above. Head metadata stays.
- `src/components/shell/PageHeader.tsx` — accept an optional `actions` slot (right-side) so the "Customize dashboard" button fits without a second component. Only if not already supported.

### Design conventions honored

- Two accents only: **tender-cyan** for the briefing frame, KPI sparklines, "high fit" scoring, map density; **signal-amber** for anything Signals-flavoured (Early Signals feed, "New" pills, amber KPI chip where relevant).
- Hairline borders on every card. `bg-surface-1/50` base, `bg-surface-2/60` for inner tiles.
- Numbers, IDs, deadlines, money, timestamps and coordinates in IBM Plex Mono w/ tabular-nums.
- Sentence case titles. Microcopy plain and active ("Explore all opportunities", "How we calculate this").
- No flags — ISO chips only.
- All data static; every value is a placeholder constant defined inside each component (no shared mock file).

### Explicitly not done

- No Lovable Cloud, no Supabase enable, no DB, no auth, no edge functions, no server functions, no `/api/*` routes, no secrets.
- No Mapbox — MapPlaceholder is static SVG only.
- No Claude API call — BriefingCard renders placeholder text with a TODO marker for phase 0B.
- No changes to Opportunities / Signals / Map / Settings routes, or to the sidebar/topbar.

### Verification before done

- Preview both themes (dark chart-room + light chart-paper); confirm the layout matches the reference proportions on desktop and stacks cleanly at ≤1024 px.
- Screenshot the dashboard for visual regression.
- Run typecheck.

### Open items

- The mock uses a light theme with blue-heavy visuals; OCTAPOD's default is dark. I'll match the reference **structure and composition exactly** but render it in the existing Baltic chart-room palette (dark by default, light "chart paper" via existing toggle). If you want the light mode to become the default here, say so and I'll flip the theme default.
- Sparklines and the Nordic map SVG are hand-drawn placeholders sized to the reference; exact curve shapes are illustrative, not data.
