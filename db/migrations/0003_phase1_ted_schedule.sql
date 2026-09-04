-- =====================================================================
-- OCTAPOD pilot — PHASE 1: daily TED ingestion schedule
-- Target: external Supabase project tsaeuuldzjdmqjeltyhw
-- Idempotent: safe to run repeatedly in the Supabase SQL Editor.
--
-- Before running, set the two values below (Supabase SQL Editor):
--   :app_base_url        e.g. https://project--<id>.lovable.app
--   :ingest_token        the same value stored as the INGEST_TRIGGER_TOKEN secret
-- =====================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Store the endpoint + token once so the cron command carries no literals.
create table if not exists public.app_settings (
  key   text primary key,
  value text not null
);

grant all on public.app_settings to service_role;
alter table public.app_settings enable row level security;
-- No policy for anon/authenticated: this table is service_role only.

insert into public.app_settings (key, value) values
  ('ingest_base_url', 'https://REPLACE-ME.lovable.app'),
  ('ingest_token',    'REPLACE-ME')
on conflict (key) do nothing;
-- After running once, set the real values:
--   update public.app_settings set value = 'https://<your-app>.lovable.app' where key = 'ingest_base_url';
--   update public.app_settings set value = '<INGEST_TRIGGER_TOKEN>'          where key = 'ingest_token';

create or replace function public.trigger_ted_ingest()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  base_url text;
  token    text;
  req_id   bigint;
begin
  select value into base_url from public.app_settings where key = 'ingest_base_url';
  select value into token    from public.app_settings where key = 'ingest_token';

  select net.http_post(
    url     := base_url || '/api/public/ingest/ted',
    headers := jsonb_build_object('content-type', 'application/json', 'x-ingest-token', token),
    body    := '{}'::jsonb
  ) into req_id;

  return req_id;
end;
$$;

-- Daily at 04:15 UTC — TED publishes overnight.
select cron.unschedule('octapod-ted-daily')
where exists (select 1 from cron.job where jobname = 'octapod-ted-daily');

select cron.schedule('octapod-ted-daily', '15 4 * * *', $$select public.trigger_ted_ingest();$$);
