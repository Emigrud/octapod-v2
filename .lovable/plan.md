# How TED tenders are currently selected — and how to close the coverage gaps

## How the filter works today

Every ingestion run asks TED's official search for notices matching three conditions at once:

1. **Subject matter** — the notice carries at least one CPV code (the EU's "what is being bought" code) starting with **45 construction, 71 engineering, 09 energy and fuels, 65 utilities**.
2. **Country** — the buyer's country is Finland **or** the place of performance is Finland.
3. **Date** — published inside the run's date window (with a 7-day overlap so late or corrected notices are picked up).

Everything else about a notice — title, buyer, value, deadline, region — is stored, not used to filter. Finland is stored as a value in the source's query, never hard-coded into the schema, so a second country is a new row, not a rewrite.

Result today: **1,427 current notices**, published 2026-04-06 to 2026-09-03.

## What this does and does not catch

TED itself only carries above-threshold notices, so roughly 70% of Finnish activity is invisible until Hilma arrives in Phase 3. That limit is by design.

Inside TED, the four-division filter is the real question. Looking at the codes actually present on the notices we already hold, several codes appear frequently but only ever as *secondary* codes on notices that qualified through 45/71/09/65:

```text
50 repair & maintenance     92     31 electrical equipment    61
32 communications equip.    90     51 installation services   45
44 pipes & materials        73     42 machinery / turbines    39
                                   48/72 IT & data services   52
```

Any Finnish notice whose **only** code sits in one of those divisions is currently invisible to us. For the sectors the strategy names, the likely misses are:

- grid and substation work coded as transformers/switchgear (31) or installation (51)
- pipeline and terminal work coded as pipes and fittings (44)
- wind, hydrogen and turbine supply coded as machinery (42)
- data centre work coded as IT infrastructure or services (48 / 72)

## Proposed work

1. **Measure before changing anything.** Run the TED search for Finland over the same 150-day window with a widened code list (31, 42, 44, 48, 51, 72 added), and count how many notices that returns which we do *not* already hold.
2. **Review the extras together.** Produce a short list of the new titles so you can judge how many are genuinely in our sectors versus noise (division 51 and 72 in particular will pull in unrelated work).
3. **Only then widen the stored source query** to the divisions you approve, re-run the backfill, and let the existing identity and hash rules absorb the overlap — no duplicates, no rewrites.
4. **Refine sector labelling** so the new codes map onto the right sector names (grid, pipelines, data centres) instead of falling through unlabelled.
5. Record the final code list and its rationale in the Phase 1 state report.

## Technical notes

- Query is built in `buildQuery()` in `src/lib/ted.server.ts` from `TED_CPV_DIVISIONS` and `TED_COUNTRY`; sector labels come from the `CPV_SECTORS` map in the same file.
- Step 1 is a read-only probe against `POST https://api.ted.europa.eu/v3/notices/search`, writing nothing to the database.
- The source register describes the filter as NUTS-based; the implementation uses `buyer-country`/`place-of-performance-country-lot` = `FIN`, which is broader and correct. The register line should be updated to match.
- No new tables, no schema change; the widened divisions are values, and country stays a data column.
