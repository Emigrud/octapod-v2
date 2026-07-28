## Goal
Remove the duplicate "Projects 6–24 Months Out" KPI card so the dashboard top row shows only the four requested cards:
1. Early Signals
2. High-Fit Opportunities
3. Total Project Value
4. Projects 6–24 Months Out

## Current state
`src/routes/index.tsx` currently contains two identical `<KpiCard>` blocks for "Projects 6–24 Months Out" (lines 77–92). The grid still uses `xl:grid-cols-5`, which was appropriate for five cards but now leaves an empty column with four cards.

## Plan
1. Open `src/routes/index.tsx`.
2. Delete the second (duplicate) `<KpiCard>` block for "Projects 6–24 Months Out".
3. Change the KPI grid from `xl:grid-cols-5` to `xl:grid-cols-4` so the four cards fill the row cleanly.
4. Run a TypeScript check to confirm no errors.

No other files need changes. No backend, database, or auth work is involved.