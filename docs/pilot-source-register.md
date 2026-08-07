# SOURCE & ACCESS REGISTER — PILOT (FINLAND)
**Every pilot data source, how it is accessed, what credentials it needs, and which phase it belongs to**

> **For the founder:** Part A is your preparation checklist.
> **For Lovable:** never invent an endpoint, an authentication method or a secret name. Use only what is defined here. If a source is marked *unverified*, run the verification task in Part E and report findings **before** writing ingestion code. Do not guess and do not silently substitute another source.

---

## Part A — Credentials preparation checklist

The pilot was scoped partly to keep this list short. Nothing here has a long waiting time.

| Credential | Needed for phase | Lead time | How to obtain |
|---|---|---|---|
| **Supabase project** | 0 | minutes | Create the project, connect it in Lovable as your own backend (not Lovable Cloud) |
| **Anthropic API key** | 2 | minutes | Anthropic Console → API keys. **Set a monthly spend limit at the same time** |
| **Mapbox access token** | 4 | minutes | Mapbox account → tokens. Restrict the token to your domain |
| **Hilma subscription key** | 3 | minutes to hours | Sign up on the Hilma API developer portal, subscribe to the **AVP** (open data) API, copy the subscription key |
| **TED** | 1 | none | No account and no key needed for reading published notices |
| **Fingrid open data key** | 5 | minutes, if required | Verify at Phase 5 — see Part C |

**Rules for handling credentials:**
- Every key goes into **Supabase secrets**. Never into Lovable chat, never into a prompt, never into frontend code, never into a document.
- If a key is ever pasted into a chat window by accident, revoke it and generate a new one.
- Use the exact secret names in Part D so prompts and code always agree.

---

## Part B — Tender sources

### Phase 1 — TED, filtered to Finland

| Field | Value |
|---|---|
| What it is | The EU's official procurement journal. Above-threshold notices from all member states |
| Docs | https://docs.ted.europa.eu/api/latest/search.html |
| Endpoint | Search API v3, `POST /v3/notices/search` |
| Authentication | **None.** The Search API is open to data reusers. API keys exist only for *submitting* notices, which we never do |
| Bulk alternative | Daily and monthly notice packages, plus datasets on data.europa.eu and a SPARQL endpoint. Use bulk for the initial backfill, the Search API for daily updates |
| Format | eForms XML. Older notices use the legacy schema — the parser must tolerate both |
| Our filter | NUTS codes for Finland, combined with CPV divisions 45 (construction), 71 (engineering), 09 (energy and fuels), 65 (utilities) |
| Known limits | Above-threshold only. Everyone receives it simultaneously — no timing advantage. This is why Hilma matters |
| Status | Verified |

### Phase 3 — Hilma (Finland)

| Field | Value |
|---|---|
| What it is | Finland's national notice service. **Includes below-threshold notices** — roughly 70% of Finnish notices never reach TED |
| Portal | Hilma API developer portal (Azure API Management) |
| Which API | **AVP API** — open data, for fetching. The ETS API is for *sending* notices and requires approval; we never use it |
| Authentication | Subscription key from the developer portal |
| Cost | Free. Commercial use permitted |
| Known limits | Rate-limited per key. Serves no CORS headers — confirming that the browser must never call it directly; all calls are server-side |
| Languages | Finnish and Swedish, occasionally English |
| Status | Verified |

**Why Hilma comes after TED in the build order:** TED is simpler and needs no credentials, so it teaches us the ingestion pattern with the fewest moving parts. Hilma then reuses that pattern and adds the deduplication problem, which only appears once two sources exist.

---

## Part C — Signal sources

### Phase 5 — Fingrid (Finnish transmission system operator)

| Field | Value |
|---|---|
| Why | The strongest early signal for grid, substation and connection work in Finland. Published by the buyer itself |
| Two different things | (a) **Public pages and documents** — network development plans, investment programmes, procurement and supplier pages, news. No credentials. (b) **Fingrid open data API** — operational and market data, may require a free API key |
| What the pilot needs | Mainly (a). Scheduled fetch of a curated list of Fingrid URLs, then Claude structured extraction. Many plans are PDFs, so extraction must handle PDF text |
| Status | (a) method verified, URL list built during Phase 5 and stored in the `sources` table, never hard-coded. (b) **unverified** — run the Part E verification task before using it, and skip it if it adds no value to the pilot |

### Phase 5 — Finnish energy and construction news

| Field | Value |
|---|---|
| Method | Curated RSS feeds and newsroom pages: energy trade press, construction trade press, and the newsrooms of major Finnish developers and utilities |
| Authentication | None |
| Cost | Free |
| Note | Highest value for effort of any signal source. The feed list is **data in the `sources` table**, so the founder can add feeds without a code change |
| Status | Method verified. The actual feed list is founder-supplied — this is domain knowledge Lovable does not have |

---

## Part D — Secret names (use exactly these)

| Secret name | Used from phase |
|---|---|
| `ANTHROPIC_API_KEY` | 2 |
| `HILMA_SUBSCRIPTION_KEY` | 3 |
| `MAPBOX_TOKEN` | 4 |
| `FINGRID_API_KEY` | 5, only if verification shows it is needed |

TED needs no secret. Any source added later gets a name in this table **before** code is written for it.

---

## Part E — Verification task template

Use at the start of any phase containing an *unverified* source.

```
Before writing any ingestion code for [SOURCE NAME], verify and report:
1. Is there an official API or open data endpoint? Give the exact URL and documentation link.
2. What authentication is required? Registration, key, token, or none?
3. What format is returned? XML, JSON, CSV, HTML page, PDF?
4. Are there rate limits or usage terms we must respect?
5. Is there a bulk or historical download we can use for backfill and for cheap testing?
6. If there is no machine access: what are the realistic options, and what does each cost in effort and fragility?

Report your findings and STOP. Do not write ingestion code until the findings are approved.
```

---

## Part F — Source health

Every source must exist as a row in the `sources` table with: name, country, kind (tender or signal), access method, secret name if any, schedule, last successful run, last record count, status. **A source that exists in code but not in this table is a bug.**

---

## Part G — Sources deliberately excluded from the pilot

Do not connect these, even though they appear in the long-term plan: Doffin (Norway), Riigihangete register (Estonia), e-Zamówienia/BZP (Poland), CVP IS (Lithuania), EIS/IUB (Latvia), udbud.dk (Denmark), Swedish commercial feeds, ENTSO-E, EU funding programmes (CEF Energy, Modernisation Fund, KPO), permit and EIA registers, X (Twitter), and approved-supplier systems (Achilles, Sellihca, JQS).

They are listed here so that adding them later is a matter of new rows and new fetch functions — never a rewrite.
