## Goal
Remove the "Countries Covered" KPI card from the dashboard's "at a glance" top row, as the user wants that box gone.

## Current state
`src/routes/index.tsx` renders a 5-card KPI row. The last card is:
- Label: "Countries Covered"
- Value: "8"
- Icon: `Globe2`
- Sparkline: country-count trend

This card is the one the user still sees at the top-right of the overview page.

## Plan
1. Open `src/routes/index.tsx`.
2. Delete the last `<KpiCard>` block (the "Countries Covered" card).
3. Remove the `Globe2` import from `lucide-react` if no other card uses it.
4. Run a TypeScript check to confirm no errors.

No other files need changes. No backend, database, or auth work is involved.