## Goal
Make the **Market Overview map** and **Signals feed** row a 50/50 two-column split.

## Current state
After moving the AI Briefing to full-width, the middle row in `src/routes/index.tsx` uses:
```jsx
<section className="grid gap-4 xl:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
  <MapPlaceholder />
  <SignalsFeed />
</section>
```
This gives the map slightly more width than the signals feed.

## Plan
1. Open `src/routes/index.tsx`.
2. Change the map/signals grid from `xl:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]` to `xl:grid-cols-2` (or `xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]`) for an equal 50/50 split.
3. Keep the existing `min-h-[560px]` and `gap-4` unchanged.
4. Run a TypeScript check to confirm no errors.

No component internals change. No backend, database, or auth work is involved.