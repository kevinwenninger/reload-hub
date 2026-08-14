-- 001_foundation — enums, private schema + helpers, profiles (+ signup
-- trigger), user_roles, firearms, components, inventory_lots.
-- Conventions (docs/DATA_MODEL.md): canonical units in mg/mm/mps/m/°C with
-- `_input` sister columns; RLS on every table; owner policies via
-- (select auth.uid()); SECURITY DEFINER functions pin search_path = ''.

-- ============================================================ roles (RBAC)

create type public.app_role as enum ('user', 'moderator', 'admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create policy "user_roles_select_own"
  on public.user_roles for select to authenticated
  using ((select auth.uid()) = user_id);
-- No insert/update/delete policies: role mutations only via future
-- role-gated RPCs / service role.

-- ==================================================== private schema + helpers

create schema private;
grant usage on schema private to authenticated;

create function private.has_role(required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = required_role
  );
$$;

revoke execute on function private.has_role(public.app_role) from public, anon;
grant execute on function private.has_role(public.app_role) to authenticated;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function private.set_updated_at() from public, anon, authenticated;

-- ================================================================= profiles

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  unit_prefs jsonb not null default
    '{"mass":"gr","length":"mm","velocity":"mps","distance":"m","temperature":"c"}',
  case_amortization_firings int not null default 10
    check (case_amortization_firings > 0),
  safety_ack_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
-- No insert/delete policies: profile rows follow auth.users via trigger/cascade.

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  insert into public.user_roles (user_id, role)
  values (new.id, 'user'::public.app_role);
  return new;
end;
$$;

revoke execute on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ================================================================= firearms

create table public.firearms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null check (type in ('rifle', 'pistol', 'revolver')),
  caliber text not null,
  secondary_calibers text[] not null default '{}',
  barrel_round_count int not null default 0 check (barrel_round_count >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index firearms_user_id_idx on public.firearms (user_id);

alter table public.firearms enable row level security;

create policy "firearms_select_own"
  on public.firearms for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "firearms_insert_own"
  on public.firearms for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "firearms_update_own"
  on public.firearms for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "firearms_delete_own"
  on public.firearms for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger firearms_set_updated_at
  before update on public.firearms
  for each row execute function private.set_updated_at();

-- =============================================================== components

create table public.components (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('bullet', 'powder', 'primer', 'case')),
  manufacturer text not null,
  name text not null,
  mpn text,
  attrs jsonb not null default '{}' check (jsonb_typeof(attrs) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index components_user_id_idx on public.components (user_id);

-- Typo guard only (never a safety validation): numeric attrs must be positive
-- numbers when present.
create function private.validate_component_attrs()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  key text;
begin
  foreach key in array array['weight_mg', 'diameter_mm'] loop
    if new.attrs ? key then
      if jsonb_typeof(new.attrs -> key) <> 'number'
         or (new.attrs ->> key)::numeric <= 0 then
        raise exception 'attrs.% must be a positive number', key;
      end if;
    end if;
  end loop;
  return new;
end;
$$;

revoke execute on function private.validate_component_attrs() from public, anon, authenticated;

create trigger components_validate_attrs
  before insert or update on public.components
  for each row execute function private.validate_component_attrs();

alter table public.components enable row level security;

create policy "components_select_own"
  on public.components for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "components_insert_own"
  on public.components for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "components_update_own"
  on public.components for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "components_delete_own"
  on public.components for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger components_set_updated_at
  before update on public.components
  for each row execute function private.set_updated_at();

-- =========================================================== inventory_lots

create table public.inventory_lots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  component_id uuid not null references public.components (id) on delete cascade,
  lot_number text,
  purchase_date date,
  source text,
  price_total numeric check (price_total >= 0),
  currency text not null default 'EUR',
  -- pieces for bullet/primer/case, grams for powder
  unit text not null check (unit in ('pieces', 'g')),
  qty_initial numeric not null check (qty_initial >= 0),
  qty_remaining numeric not null check (qty_remaining >= 0),
  -- case lots only: firings tracked per lot (decision 2026-08-14)
  firings_count int check (firings_count >= 0),
  trimmed_to_mm numeric check (trimmed_to_mm > 0),
  trimmed_to_input text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inventory_lots_user_id_idx on public.inventory_lots (user_id);
create index inventory_lots_component_id_idx on public.inventory_lots (component_id);

alter table public.inventory_lots enable row level security;

create policy "inventory_lots_select_own"
  on public.inventory_lots for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "inventory_lots_insert_own"
  on public.inventory_lots for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "inventory_lots_update_own"
  on public.inventory_lots for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "inventory_lots_delete_own"
  on public.inventory_lots for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger inventory_lots_set_updated_at
  before update on public.inventory_lots
  for each row execute function private.set_updated_at();
