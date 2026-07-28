# OCTAPOD — Reusable UI primitives

Every later phase reuses these components. Do not fork them and do not add a
parallel set. Extend with variants when needed.

## The accent contract (non-negotiable)

Colour is information, never decoration. OCTAPOD has exactly **two functional
accents**, defined once in `src/styles.css`:

| Token             | Colour     | Meaning                          |
| ----------------- | ---------- | -------------------------------- |
| `--accent-tender` | Ice-cyan   | Tenders (TED, Hilma, …)          |
| `--accent-signal` | Amber      | Early signals (grid plans, news) |

Never use tender-cyan for signals, never use signal-amber for tenders, and
never introduce a third accent for a new data category — pick which of the two
it belongs to.

Neutrals (`--surface-1..3`, `--muted-foreground`, `--hairline`, …) carry
everything else. Status colours (`--status-success/warning/danger`) are for
system state (ingestion health, errors), never for data classification.

## Components

- `DataTable` — dense typographic table. Mono/tabular for numeric columns.
  Handles `state="ready" | "loading" | "empty" | "error"`.
- `FilterBar` — search + chip filters + `Save filter` action. Same states.
- `StatCard` — labelled metric. `variant="tender" | "signal" | "neutral"`
  drives the left accent stripe.
- `Tag` / `CountryChip` — hairline chip. `variant` covers tender / signal /
  neutral / country / success / danger. Country chips are ISO codes, never flags.
- `EmptyState` — page-level empty. Sentence case, plain, active microcopy.

## Design tokens

All tokens live in `src/styles.css` inside `@theme inline`, `:root`/`.dark`,
and `.light`. Never hardcode hex or Tailwind palette classes (`text-white`,
`bg-slate-900`, `bg-[#…]`) in components — use semantic tokens.

## Type

- `--font-display` — Space Grotesk, headings only, used with restraint.
- `--font-sans` — Inter, UI and body.
- `--font-mono` — IBM Plex Mono, numbers/IDs/coordinates/money (`.tabular`).
