-- 006_loaded_batches — one row per loading session of a version: date, qty,
-- optional bench conditions. load_versions.rounds_loaded becomes a maintained
-- total (trigger) instead of a hand-typed number. Pulled forward from the
-- phase-4 plan (docs/DATA_MODEL.md, decision 2); checklist_run_id arrives with
-- migration 007.

create table public.loaded_batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  load_version_id uuid not null references public.load_versions (id) on delete cascade,
  date date not null default current_date,
  qty int not null check (qty > 0),
  qty_remaining int not null check (qty_remaining >= 0),
  room_temperature_c numeric,
  room_temperature_input text,
  humidity_pct numeric check (humidity_pct >= 0 and humidity_pct <= 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index loaded_batches_user_id_idx on public.loaded_batches (user_id);
create index loaded_batches_load_version_id_idx
  on public.loaded_batches (load_version_id);

alter table public.loaded_batches enable row level security;

create policy "loaded_batches_select_own"
  on public.loaded_batches for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "loaded_batches_insert_own"
  on public.loaded_batches for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "loaded_batches_update_own"
  on public.loaded_batches for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "loaded_batches_delete_own"
  on public.loaded_batches for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger loaded_batches_set_updated_at
  before update on public.loaded_batches
  for each row execute function private.set_updated_at();

-- Keep load_versions.rounds_loaded = sum(qty) of its batches.
create function private.apply_loaded_batch_delta()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  delta int;
begin
  if tg_op = 'INSERT' then
    delta := new.qty;
  elsif tg_op = 'UPDATE' then
    delta := new.qty - old.qty;
  else
    delta := -old.qty;
  end if;
  if delta <> 0 then
    update public.load_versions
    set rounds_loaded = greatest(0, rounds_loaded + delta)
    where id = coalesce(new.load_version_id, old.load_version_id);
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke execute on function private.apply_loaded_batch_delta()
  from public, anon, authenticated;

create trigger loaded_batches_rounds_delta
  after insert or update or delete on public.loaded_batches
  for each row execute function private.apply_loaded_batch_delta();
