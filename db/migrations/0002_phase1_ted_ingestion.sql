-- =====================================================================
-- OCTAPOD pilot — PHASE 1: TED ingestion (shared market data)
-- Target: external Supabase project tsaeuuldzjdmqjeltyhw
-- Idempotent: safe to run repeatedly in the Supabase SQL Editor.
--
-- Tables: sources, raw_documents, opportunities, ingest_runs
-- RLS: readable by any authenticated user (shared market data),
--      writable only by service_role.
-- Country is a data column everywhere. Nothing is hard-coded to Finland.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'source_kind') then
    create type public.source_kind as enum ('tender', 'signal');
  end if;
  if not exists (select 1 from pg_type where typname = 'opportunity_kind') then
    create type public.opportunity_kind as enum ('tender', 'project');
  end if;
end
$$;

-- ---------------------------------------------------------------------
-- sources
-- ---------------------------------------------------------------------
create table if not exists public.sources (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  country            text,                      -- ISO alpha-3; null = multi-country
  kind               public.source_kind not null,
  access_method      text not null,             -- e.g. 'search_api_v3', 'rss'
  secret_name        text,                      -- null when no credential is needed
  schedule           text,                      -- cron expression, documentation only
  last_run_at        timestamptz,
  last_record_count  integer,
  status             text not null default 'active',
  cursor_at          timestamptz,               -- ingestion cursor (rule 4)
  created_at         timestamptz not null default now()
);

create unique index if not exists sources_name_key on public.sources (name);

grant select on public.sources to authenticated;
grant all    on public.sources to service_role;

alter table public.sources enable row level security;

drop policy if exists "Authenticated can read sources" on public.sources;
create policy "Authenticated can read sources"
  on public.sources for select to authenticated using (true);

drop policy if exists "Service role manages sources" on public.sources;
create policy "Service role manages sources"
  on public.sources for all to service_role using (true) with check (true);

-- ---------------------------------------------------------------------
-- raw_documents  (rule 1: always store the original)
-- ---------------------------------------------------------------------
create table if not exists public.raw_documents (
  id          uuid primary key default gen_random_uuid(),
  source_id   uuid not null references public.sources (id) on delete cascade,
  native_id   text not null,                    -- rule 2: the source's own id
  url         text,                             -- source_url, always resolvable
  fetched_at  timestamptz not null default now(),
  hash        text not null,                    -- rule 3: content fingerprint
  payload     jsonb not null,
  lang        text,                             -- detected language of the record
  created_at  timestamptz not null default now()
);

-- Rule 2 + rule 3: same identity AND same content is stored once; a changed
-- hash creates a NEW row, so version history is preserved (never overwritten).
create unique index if not exists raw_documents_source_native_hash_key
  on public.raw_documents (source_id, native_id, hash);
create index if not exists raw_documents_source_native_idx
  on public.raw_documents (source_id, native_id);
create index if not exists raw_documents_fetched_at_idx
  on public.raw_documents (fetched_at desc);

grant select on public.raw_documents to authenticated;
grant all    on public.raw_documents to service_role;

alter table public.raw_documents enable row level security;

drop policy if exists "Authenticated can read raw documents" on public.raw_documents;
create policy "Authenticated can read raw documents"
  on public.raw_documents for select to authenticated using (true);

drop policy if exists "Service role manages raw documents" on public.raw_documents;
create policy "Service role manages raw documents"
  on public.raw_documents for all to service_role using (true) with check (true);

-- ---------------------------------------------------------------------
-- opportunities
-- ---------------------------------------------------------------------
create table if not exists public.opportunities (
  id              uuid primary key default gen_random_uuid(),
  kind            public.opportunity_kind not null default 'tender',
  title           text,
  buyer_name      text,
  country         text,                         -- ISO alpha-3, data column
  nuts            text[] not null default '{}',
  cpv             text[] not null default '{}',
  sectors         text[] not null default '{}',
  est_value       numeric,
  currency        text,
  published_at    timestamptz,
  deadline_at     timestamptz,
  status          text not null default 'open',
  source_id       uuid not null references public.sources (id) on delete cascade,
  raw_document_id uuid references public.raw_documents (id) on delete set null,
  native_id       text not null,
  version         integer not null default 1,
  superseded_by   uuid references public.opportunities (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Rule 2: the primary duplicate defence — one CURRENT row per (source, native id).
create unique index if not exists opportunities_current_source_native_key
  on public.opportunities (source_id, native_id)
  where superseded_by is null;
-- Rule 3: full version history is retained and addressable.
create unique index if not exists opportunities_source_native_version_key
  on public.opportunities (source_id, native_id, version);
create index if not exists opportunities_published_at_idx  on public.opportunities (published_at desc);
create index if not exists opportunities_deadline_at_idx   on public.opportunities (deadline_at);
create index if not exists opportunities_country_idx       on public.opportunities (country);
create index if not exists opportunities_cpv_idx           on public.opportunities using gin (cpv);

grant select on public.opportunities to authenticated;
grant all    on public.opportunities to service_role;

alter table public.opportunities enable row level security;

drop policy if exists "Authenticated can read opportunities" on public.opportunities;
create policy "Authenticated can read opportunities"
  on public.opportunities for select to authenticated using (true);

drop policy if exists "Service role manages opportunities" on public.opportunities;
create policy "Service role manages opportunities"
  on public.opportunities for all to service_role using (true) with check (true);

-- ---------------------------------------------------------------------
-- ingest_runs  (rule 5: one row per run)
-- ---------------------------------------------------------------------
create table if not exists public.ingest_runs (
  id            uuid primary key default gen_random_uuid(),
  source_id     uuid not null references public.sources (id) on delete cascade,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  fetched       integer not null default 0,
  new_count     integer not null default 0,
  updated_count integer not null default 0,
  failed        integer not null default 0,
  error_text    text,
  duration_ms   integer,
  tokens_used   integer not null default 0,
  est_cost      numeric  not null default 0,
  trigger       text not null default 'manual',  -- 'manual' | 'cron' | 'backfill'
  window_from   timestamptz,
  window_to     timestamptz
);

create index if not exists ingest_runs_started_at_idx on public.ingest_runs (started_at desc);
create index if not exists ingest_runs_source_idx     on public.ingest_runs (source_id, started_at desc);

grant select on public.ingest_runs to authenticated;
grant all    on public.ingest_runs to service_role;

alter table public.ingest_runs enable row level security;

drop policy if exists "Authenticated can read ingest runs" on public.ingest_runs;
create policy "Authenticated can read ingest runs"
  on public.ingest_runs for select to authenticated using (true);

drop policy if exists "Service role manages ingest runs" on public.ingest_runs;
create policy "Service role manages ingest runs"
  on public.ingest_runs for all to service_role using (true) with check (true);

-- ---------------------------------------------------------------------
-- First source row: TED (no credential required)
-- ---------------------------------------------------------------------
insert into public.sources (name, country, kind, access_method, secret_name, schedule, status)
values ('TED', null, 'tender', 'search_api_v3', null, '0 4 * * *', 'active')
on conflict (name) do update
  set kind = excluded.kind,
      access_method = excluded.access_method,
      schedule = excluded.schedule;
