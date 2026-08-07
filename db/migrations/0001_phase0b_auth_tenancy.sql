-- PHASE 0B — authentication and tenancy
-- Target: YOUR external Supabase project (ref tsaeuuldzjdmqjeltyhw)
-- How to apply: Supabase Dashboard -> SQL Editor -> paste this whole file -> Run.
-- Idempotent: safe to run twice.
-- Creates: org_role enum, organizations, org_members, membership helpers,
-- signup trigger, grants and RLS policies. No product/domain tables here.

-- 1. ROLE ENUM ---------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'org_role') then
    create type public.org_role as enum ('owner', 'admin', 'member');
  end if;
end
$$;

-- 2. TABLES ------------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 120),
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.organizations to authenticated;
grant all on public.organizations to service_role;

create table if not exists public.org_members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.org_role not null default 'member',
  user_email text,
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

grant select, insert, update, delete on public.org_members to authenticated;
grant all on public.org_members to service_role;

create index if not exists org_members_user_id_idx on public.org_members (user_id);
create index if not exists org_members_org_id_idx on public.org_members (org_id);
create index if not exists organizations_created_at_idx on public.organizations (created_at desc);

-- 3. MEMBERSHIP HELPERS (security definer, avoids RLS recursion) -------------
create or replace function public.is_org_member(_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = _org_id and m.user_id = auth.uid()
  )
$$;

create or replace function public.has_org_role(_org_id uuid, _roles public.org_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = _org_id
      and m.user_id = auth.uid()
      and m.role = any(_roles)
  )
$$;

revoke all on function public.is_org_member(uuid) from public, anon;
revoke all on function public.has_org_role(uuid, public.org_role[]) from public, anon;
grant execute on function public.is_org_member(uuid) to authenticated, service_role;
grant execute on function public.has_org_role(uuid, public.org_role[]) to authenticated, service_role;

-- 4. SIGNUP TRIGGER — create an organization and make the user its owner -----
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _org_name text;
  _org_id uuid;
begin
  _org_name := btrim(coalesce(new.raw_user_meta_data ->> 'organization_name', ''));

  if _org_name = '' then
    -- Never create an unnamed organization. Fall back to the email domain.
    _org_name := split_part(coalesce(new.email, 'organization'), '@', 2);
    if btrim(_org_name) = '' then
      _org_name := 'Organization';
    end if;
  end if;

  insert into public.organizations (name)
  values (left(_org_name, 120))
  returning id into _org_id;

  insert into public.org_members (org_id, user_id, role, user_email)
  values (_org_id, new.id, 'owner', new.email)
  on conflict (org_id, user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. ROW LEVEL SECURITY ------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;

-- organizations
drop policy if exists "Members can read their organizations" on public.organizations;
create policy "Members can read their organizations"
on public.organizations for select to authenticated
using (public.is_org_member(id));

drop policy if exists "Owners and admins can update their organization" on public.organizations;
create policy "Owners and admins can update their organization"
on public.organizations for update to authenticated
using (public.has_org_role(id, array['owner','admin']::public.org_role[]))
with check (public.has_org_role(id, array['owner','admin']::public.org_role[]));

drop policy if exists "Owners can delete their organization" on public.organizations;
create policy "Owners can delete their organization"
on public.organizations for delete to authenticated
using (public.has_org_role(id, array['owner']::public.org_role[]));

-- No INSERT policy on organizations: they are created only by the signup trigger.

-- org_members
drop policy if exists "Members can read their org membership rows" on public.org_members;
create policy "Members can read their org membership rows"
on public.org_members for select to authenticated
using (public.is_org_member(org_id));

drop policy if exists "Owners and admins can add members" on public.org_members;
create policy "Owners and admins can add members"
on public.org_members for insert to authenticated
with check (public.has_org_role(org_id, array['owner','admin']::public.org_role[]));

drop policy if exists "Owners and admins can update members" on public.org_members;
create policy "Owners and admins can update members"
on public.org_members for update to authenticated
using (public.has_org_role(org_id, array['owner','admin']::public.org_role[]))
with check (public.has_org_role(org_id, array['owner','admin']::public.org_role[]));

drop policy if exists "Owners and admins can remove members" on public.org_members;
create policy "Owners and admins can remove members"
on public.org_members for delete to authenticated
using (public.has_org_role(org_id, array['owner','admin']::public.org_role[]));
