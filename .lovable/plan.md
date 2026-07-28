
## Match the reference exactly — palette, logo, shell details

The current dashboard has the right structure but reads as our dark "chart-room" world. The reference is a **bright, near-white dashboard with a single dominant blue accent**. Retune the design tokens, swap the logo, and align the shell/nav so the app looks like the mockup.

### 1. Palette overhaul (`src/styles.css`)

Make the light theme the default and rebuild it to match the mockup, not the current warm "chart paper":

- `--background`: pure near-white (`oklch(0.99 0 0)`).
- `--surface-1` / `--surface-2` / `--surface-3`: `#ffffff` cards, `#f6f8fb` sidebar/rails, `#eef2f7` hover.
- `--foreground`: near-black slate; `--muted-foreground` mid slate; `--subtle-foreground` light slate.
- `--border` / `--hairline`: cool light gray (`#e5e9f0` / same at ~55% alpha).
- **Single primary accent = bright cornflower blue** (`oklch(0.58 0.19 258)`, ≈`#2f6bff`), used for:
  - the octopus logo,
  - active nav item bg + text,
  - KPI sparklines and numeric highlights,
  - the AI briefing frame + icons,
  - fit scores, "View all" links, primary buttons, chart lines.
- Rename the accent contract from "tender-cyan / signal-amber" to **"primary-blue" for tenders/actions/highlights** and **"signal" tokens map to the same blue by default** — the mockup uses blue as the single accent. Keep the amber token available but reserve it for the small "New" / "High Impact" pills only, tuned to a soft warm amber that reads as a highlight, not a competing accent.
- Category tile colors (for signal-feed and activity icons): a small semantic palette of muted tile backgrounds — blue, teal, orange, green — used **only** as icon-tile fills, never as text or borders. Adds the visual variety the mockup has without breaking the "one accent" rule for actionable UI.
- Retire the dark chart-room palette as the default. Keep it available under the existing `.dark` class so the theme toggle still works, but ship light as default. If you'd rather delete dark mode entirely, say so and I'll drop the toggle.

### 2. Logo swap

Register the uploaded octopus PNG as a Lovable Asset (`src/assets/oktapod-logo.png.asset.json`) via `lovable-assets create` from `/mnt/user-uploads/`. Replace the current inline compass SVG in `src/components/shell/Sidebar.tsx` with an `<img>` sized to ~28px using that asset. Update the wordmark next to it to lowercase "oktapod" (Space Grotesk medium) to match the mock. Also add the logomark + wordmark to the browser favicon and root `head()` og:image.

### 3. Sidebar to match the mock

Currently: Dashboard / Opportunities / Signals / Map / Settings. The mock shows a richer nav split into two groups. Options — I'll go with **A** unless you say otherwise:

- **A. Match mock 1:1** — top group: `Overview`, `Early Signals (24)`, `Tenders (128)`, `Projects`, `Map`, `Calendar`, `Competitors`, `Reports`. Bottom group under "My Settings": `My Profile`, `Company Profile`, `Alerts & Subscriptions`. Bottom card: "Data Coverage · 8 Countries" (flag row → see open question) and "System Status · All systems operational · Last update 2 min ago". "What's New" pinned button at the very bottom.
- **B. Keep the current 5 items** and only restyle. Simpler but drifts from the mock.

Active state: light-blue pill background (`bg-primary/10`) with primary-blue text and icon, mirroring the mock. Numeric badges (24 / 128) sit on the right in muted mono.

### 4. TopBar to match the mock

Rework `src/components/shell/TopBar.tsx`:
- Left: centered global search input with `⌘K` chip.
- Right: organization selector chip ("Demo Construction Oy ▾"), a bell icon with a red `3` badge, and a circular user avatar tile with initials "JP" + name/role stack.
- Drop the UTC clock + "All sources idle" indicator (those don't appear in the mock).
- Theme toggle moves into the org menu as a secondary control (or is removed if you want to hard-lock light mode).

### 5. Dashboard details tuned to the mock

- KPI strip: white cards, colored icon tile on the left (blue / teal / orange / green / blue — decorative tile colors only), big number, delta line, blue sparkline on the right. Fifth card ("Countries Covered") shows a small Nordic silhouette instead of a sparkline.
- Row 2 (map / briefing / signals): stays as the three-panel composition already built, but with the new palette. The AI briefing card becomes the mock's crisp look — blue-tinted border, blue sparkle icon, "AI Situational Awareness Briefing" title (title case in the header to match the mock's typography), muted body text, blue "View full briefing" link. Placeholder copy stays (Claude wire-up next phase).
- Signals feed: each row's icon tile uses the small category palette (blue for grid, teal for data-center, blue for wind, blue for solar, etc.) with primary-blue "New" pill; the filter chip row uses the light-blue active state.
- Bottom four cards: same layout, retuned to white surfaces + blue accents. "Your Competitive Edge" `412 days` renders in primary blue.

### 6. Files to change

- **Modify**: `src/styles.css` (full light-first token rewrite), `src/routes/__root.tsx` (default `<html>` class = light, load fonts unchanged, add favicon), `src/components/shell/Sidebar.tsx` (logo + new nav + bottom cards), `src/components/shell/TopBar.tsx` (search + org + bell + avatar), `src/components/shell/ThemeToggle.tsx` (only if we keep dark mode), `src/components/dashboard/KpiCard.tsx` (tile-color prop), `src/components/dashboard/BriefingCard.tsx` (title casing + link copy), `src/components/dashboard/SignalsFeed.tsx` (per-row tile color), `src/components/dashboard/MapPlaceholder.tsx` (blue hotspots).
- **New**: `src/assets/oktapod-logo.png.asset.json` (registered CDN pointer to the uploaded logo), and possibly `src/components/shell/UserMenu.tsx` for the topbar avatar block.
- **No new routes**, no backend, no Cloud/Supabase, no auth, no server functions.

### 7. Explicitly not done

- No backend, no database, no auth, no edge functions, no Cloud enable.
- No Mapbox — MapPlaceholder stays a static SVG in the new palette.
- No Claude call — BriefingCard remains placeholder text with the `TODO(phase 0B)` marker.
- No changes to Opportunities / Signals / Map / Settings route contents beyond palette bleed-through.

### 8. Open questions

1. **Flags vs ISO chips**: the mock shows tiny country flag pills in the sidebar "Data Coverage". Our earlier design rule was "ISO codes, never flags." Match the mock (add flag pills, sidebar only) or hold the rule (keep `CountryChip` ISO codes)? Default if you don't answer: I'll match the mock with small round flag pills in the sidebar only, and keep ISO chips everywhere else.
2. **Dark mode**: keep the toggle so `.dark` still works, or delete it and go light-only? Default: keep the toggle.
3. **Sidebar coverage** — go with option **A** (mock 1:1, 8 nav items + settings group + coverage/status/what's-new)? The extra routes (`/projects`, `/calendar`, `/competitors`, `/reports`) will be styled placeholder empty pages using the existing `EmptyState` primitive so the sidebar links resolve. Default: yes, option A.
