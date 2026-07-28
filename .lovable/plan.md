# Plan: Move and enlarge the sidebar logo

## Goal
Make the oktapod logo much larger and relocate it from the top of the sidebar to the bottom-left area, so it acts as a bold footer mark rather than a small header icon.

## Current state
- The sidebar is a fixed 228 px wide left rail (`md:w-[228px]`).
- The logo is currently rendered at the top of the sidebar as a 40 px tall image (`h-10`) next to no other text.
- The bottom of the sidebar currently contains a "System status" card and a "What's new" button.
- The logo asset is already loaded via `src/assets/oktapod-logo-transparent.png.asset.json` and imported in `src/components/shell/Sidebar.tsx`.

## Changes
1. **Remove the top logo block** from the sidebar header area.
2. **Add a footer logo block** at the very bottom of the sidebar, below the existing "What's new" button.
3. **Enlarge the logo** so it fills the available sidebar width with comfortable padding (target roughly 180–200 px wide, height auto to preserve the original aspect ratio of the uploaded horizontal logo).
4. **Preserve spacing and alignment** so the logo does not overlap the system-status/what's-new items and stays visually anchored in the bottom-left.
5. **No functional changes** — no backend, navigation, or routing work.

## Files to edit
- `src/components/shell/Sidebar.tsx` — move and resize the logo markup.

## Verification
- Run a TypeScript check (`bunx tsc --noEmit`) to confirm the component still compiles.
- Visually confirm the logo appears at the bottom of the sidebar at a much larger size and remains fully inside the rail.
