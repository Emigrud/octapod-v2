Goal: Reposition the large transparent logo so it appears in the empty space immediately below the "Alerts & Subscriptions" settings item, not at the bottom of the sidebar.

What I will change:
1. In `src/components/shell/Sidebar.tsx`:
   - Remove the current `<img>` logo block from the very bottom of the `<aside>` (below the "What's new" button).
   - Insert the logo block inside the `<nav>` directly after the SETTINGS_NAV list that ends with "Alerts & Subscriptions".
   - Keep the logo sizable but proportional: `w-full max-w-[180px] h-auto mx-auto` with `pt-4 pb-2` so it sits in the new gap without crowding the nav items.
   - Tighten the outer bottom padding of the `<nav>` or adjust the system-status cards if needed to keep the overall sidebar height balanced.

What will stay the same:
- The navigation items, ordering, badges, and system-status / "What's new" cards remain unchanged.
- No backend, database, auth, or new routes are created.
- The light/dark theme and design tokens are untouched.

Expected result: A large, readable logo appears centered in the sidebar directly below the Alerts & Subscriptions link, with system status and What's new still stacked below it near the bottom.