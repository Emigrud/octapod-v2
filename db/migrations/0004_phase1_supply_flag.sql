-- PHASE 1 (widened scope) — supply vs works/services flag
-- Idempotent. Target: external Supabase project tsaeuuldzjdmqjeltyhw.
--
-- is_supply distinguishes supply/materials contracts (e.g. a pipe supply
-- framework) from works/services contracts (e.g. pipeline construction).
-- Derived at ingestion time from the primary CPV division and the notice type;
-- see sectorsFromCpv / deriveIsSupply in src/lib/ted.server.ts.

alter table public.opportunities
  add column if not exists is_supply boolean;

create index if not exists opportunities_is_supply_idx
  on public.opportunities (is_supply)
  where superseded_by is null;

comment on column public.opportunities.is_supply is
  'true = supply/materials contract, false = works or services contract, null = undetermined. Derived from CPV division + notice type.';
