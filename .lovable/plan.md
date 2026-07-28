## Fix: Add top spacing to the sidebar navigation

### Current state
`src/components/shell/Sidebar.tsx` renders the navigation `<nav>` element with `px-3 pb-4` but no `pt-*` class. The first item, **Overview**, sits flush against the top edge of the sidebar rail.

### Change
Add a small top padding to the sidebar `<nav>` so the **Overview** button no longer touches the top of the screen.

- File: `src/components/shell/Sidebar.tsx`
- Edit: change `<nav className="flex-1 overflow-y-auto px-3 pb-4">` to include `pt-3` (e.g. `pt-3 px-3 pb-4`).
- Verify: visually confirm the Overview row has a few pixels of breathing room at the top, then run `bunx tsc --noEmit` (or `tsgo`) to ensure the change is type-safe.

### Scope
- No new components, routes, backend, database, auth, or Lovable Cloud changes.
- Only the single sidebar spacing adjustment.