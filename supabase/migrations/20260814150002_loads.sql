-- 002_loads — loads (firearm-bound) + load_versions (immutable once
-- finalized). App layer must render LoadDataDisclaimer wherever charge_* is
-- shown. The plausibility trigger is a TYPO GUARD ONLY — never a safety
-- validation (docs/DATA_MODEL.md).

-- ==================================================================== loads

create table public.loads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  firearm_id uuid not null references public.firearms (id) on delete cascade,
  caliber text not null,
  name text not null,
  status text not null default 'development'
    check (status in ('development', 'proven', 'retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index loads_user_id_idx on public.loads (user_id);
create index loads_firearm_id_idx on public.loads (firearm_id);

alter table public.loads enable row level security;

create policy "loads_select_own"
  on public.loads for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "loads_insert_own"
  on public.loads for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "loads_update_own"
  on public.loads for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "loads_delete_own"
  on public.loads for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger loads_set_updated_at
  before update on public.loads
  for each row execute function private.set_updated_at();

-- ============================================================ load_versions

create table public.load_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  load_id uuid not null references public.loads (id) on delete cascade,
  version_no int not null check (version_no > 0),
  -- component references; lots optional (docs/DATA_MODEL.md)
  bullet_component_id uuid references public.components (id) on delete restrict,
  bullet_lot_id uuid references public.inventory_lots (id) on delete set null,
  powder_component_id uuid references public.components (id) on delete restrict,
  powder_lot_id uuid references public.inventory_lots (id) on delete set null,
  primer_component_id uuid references public.components (id) on delete restrict,
  primer_lot_id uuid references public.inventory_lots (id) on delete set null,
  case_component_id uuid references public.components (id) on delete restrict,
  case_lot_id uuid references public.inventory_lots (id) on delete set null,
  -- measurements: canonical + raw input sisters
  charge_mg numeric check (charge_mg > 0),
  charge_input text,
  coal_mm numeric check (coal_mm > 0),
  coal_input text,
  cbto_mm numeric check (cbto_mm > 0),
  cbto_input text,
  crimp text not null default 'none' check (crimp in ('none', 'roll', 'taper')),
  neck_bushing_mm numeric check (neck_bushing_mm > 0),
  neck_bushing_input text,
  shoulder_bump_mm numeric check (shoulder_bump_mm >= 0),
  shoulder_bump_input text,
  changelog text,
  notes text,
  finalized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (load_id, version_no)
);

create index load_versions_user_id_idx on public.load_versions (user_id);
create index load_versions_load_id_idx on public.load_versions (load_id);

alter table public.load_versions enable row level security;

create policy "load_versions_select_own"
  on public.load_versions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "load_versions_insert_own"
  on public.load_versions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "load_versions_update_own"
  on public.load_versions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "load_versions_delete_own"
  on public.load_versions for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger load_versions_set_updated_at
  before update on public.load_versions
  for each row execute function private.set_updated_at();

-- Immutability: once finalized, a version can neither be updated nor deleted.
-- Changes after finalizing = create a new version.
create function private.block_finalized_load_version_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.finalized_at is not null then
    raise exception 'load version % is finalized and immutable — create a new version instead', old.version_no;
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke execute on function private.block_finalized_load_version_mutation()
  from public, anon, authenticated;

create trigger load_versions_block_finalized_update
  before update on public.load_versions
  for each row execute function private.block_finalized_load_version_mutation();

create trigger load_versions_block_finalized_delete
  before delete on public.load_versions
  for each row execute function private.block_finalized_load_version_mutation();

-- Typo guard ONLY (never framed as a safety validation): a powder charge
-- heavier than the bullet is almost certainly a unit or input mistake.
create function private.check_load_version_typos()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  bullet_weight numeric;
begin
  if new.charge_mg is not null and new.bullet_component_id is not null then
    select (attrs ->> 'weight_mg')::numeric
    into bullet_weight
    from public.components
    where id = new.bullet_component_id;
    if bullet_weight is not null and new.charge_mg >= bullet_weight then
      raise exception 'charge (% mg) is not below the bullet weight (% mg) — likely a typo or unit mix-up',
        new.charge_mg, bullet_weight;
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function private.check_load_version_typos()
  from public, anon, authenticated;

create trigger load_versions_check_typos
  before insert or update on public.load_versions
  for each row execute function private.check_load_version_typos();
