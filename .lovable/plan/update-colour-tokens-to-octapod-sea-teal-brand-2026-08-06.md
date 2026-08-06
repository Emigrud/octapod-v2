# Update colour tokens to OCTAPOD sea-teal brand

## Goal
Replace the indigo-blue brand colours in `src/styles.css` with the new sea-teal palette, updating **only** the `:root, .light` token values. No components, layout, or fonts will be touched.

## What will change

File: `src/styles.css` — lines 108–172 only (`:root, .light` block).

### 1. Core tokens from the provided hex values

These values will be written exactly as the converted oklch values, matching the existing file format.

| Token | New oklch value |
| --- | --- |
| `--background` | `oklch(0.9724 0.0053 197.90)` |
| `--surface-1` | `oklch(1 0 0)` (white) |
| `--surface-2` | `oklch(0.9544 0.0096 197.45)` |
| `--surface-3` | `oklch(0.9431 0.0128 197.28)` |
| `--border` | `oklch(0.9167 0.0160 197.14)` |
| `--hairline` | `oklch(0.9167 0.0160 197.14 / 90%)` |
| `--foreground` | `oklch(0.3005 0.0407 216.21)` |
| `--muted-foreground` | `oklch(0.5369 0.0365 208.52)` |
| `--subtle-foreground` | `oklch(0.6504 0.0310 207.52)` |
| `--accent-primary` | `oklch(0.5362 0.0888 205.06)` |

### 2. Derived primary-accent tokens

To keep the accent family consistent, the tokens that reference the old primary hue will also be updated to the new teal value.

| Token | New value |
| --- | --- |
| `--accent-primary-muted` | `oklch(0.5362 0.0888 205.06 / 10%)` |
| `--accent-primary-ring` | `oklch(0.5362 0.0888 205.06 / 30%)` |
| `--ring` | `oklch(0.5362 0.0888 205.06)` |

### 3. Decorative background gradients

The `--isoline-bg` and `--grid-bg` gradients currently use the old indigo-blue primary. They will be switched to the new teal accent so the page background remains consistent with the brand.

Old references like `oklch(0.55 0.20 258 / X%)` will become `oklch(0.5362 0.0888 205.06 / X%)`.

### 4. Tokens left unchanged

- `--accent-signal` and its derived tokens remain at `oklch(0.68 0.15 65)` amber.
- `--accent-primary-foreground` stays white (`oklch(1 0 0)`).
- `--muted` stays tied to `--surface-2`.
- Decorative category tile colours (`--tile-*`) are unchanged.
- Status colours (`--status-*`) are unchanged.
- The dark theme block (`.dark`) is unchanged.
- Fonts, radii, layout utilities, and component styles are untouched.

## Verification

After the change, I will confirm:

1. The exact oklch values written for each listed token.
2. Contrast between `--foreground` (`#12333B`) and `--background` (`#F2F7F7`) is **12.43:1**, which exceeds WCAG AA for body text (4.5:1) and AAA (7:1).
3. No other source files were modified, and no font or layout tokens were changed.
