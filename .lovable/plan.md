## Goal
Move the **AI Situational Awareness Briefing** so it sits directly below the KPI row as a full-width section, with the Map and Signals feed as a two-column row underneath.

## Current state
`src/routes/index.tsx` renders the middle row as a 3-column grid:
- Column 1: `MapPlaceholder` (3fr)
- Column 2: `BriefingCard` (5fr)
- Column 3: `SignalsFeed` (3fr)

All three columns share `min-h-[560px]`.

## Proposed new layout
1. KPI row (4 cards) — unchanged.
2. **Full-width AI Briefing** section — `BriefingCard` spanning the full width.
3. **Two-column row** — `MapPlaceholder` on the left and `SignalsFeed` on the right.
4. Bottom four panels — unchanged.

## Plan
1. Open `src/routes/index.tsx`.
2. Insert a new full-width section immediately after the KPI row containing `<BriefingCard />` in a wrapper with `min-h-[420px]` (or similar) so the briefing keeps a healthy vertical presence without being as tall as the map/signals row.
3. Change the existing 3-column middle section to a 2-column grid for `MapPlaceholder` and `SignalsFeed` only, keeping `min-h-[560px]` for both.
4. Adjust the grid proportions for the map/signals row to a reasonable split (e.g., `minmax(0,5fr) minmax(0,4fr)` or `1fr 1fr`).
5. Run a TypeScript check to confirm no errors.

No component internals change — only the page layout in `src/routes/index.tsx`. No backend, database, or auth work is involved.