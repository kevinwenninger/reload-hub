-- 003_range — range_sessions, shot_strings, shots, shot_string_stats view,
-- targets storage bucket + owner policies, firearm round-counter trigger.
-- All range writes arrive through the offline write queue as idempotent
-- upserts with client-generated UUIDs (docs/RANGE_FLOWS.md).

-- =========================================================== range_sessions

create table public.range_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  firearm_id uuid not null references public.firearms (id) on delete cascade,
  -- null = factory ammo, described in ammo_note
  load_version_id uuid references public.load_versions (id) on delete set null,
  ammo_note text,
  date date not null default current_date,
  location text,
  distance_m numeric check (distance_m > 0),
  distance_input text,
  temperature_c numeric,
  temperature_input text,
  wind text,
  weather_notes text,
  rounds_fired int not null default 0 check (rounds_fired >= 0),
  group_size_mm numeric check (group_size_mm > 0),
  group_size_input text,
  rating smallint check (rating between 1 and 5),
  lessons_learned text,
  -- neutral observations, never an assessment by the app
  pressure_flags text[] not null default '{}',
  photos text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index range_sessions_user_id_idx on public.range_sessions (user_id);
create index range_sessions_firearm_id_idx on public.range_sessions (firearm_id);
create index range_sessions_load_version_id_idx
  on public.range_sessions (load_version_id);

alter table public.range_sessions enable row level security;

create policy "range_sessions_select_own"
  on public.range_sessions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "range_sessions_insert_own"
  on public.range_sessions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "range_sessions_update_own"
  on public.range_sessions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "range_sessions_delete_own"
  on public.range_sessions for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger range_sessions_set_updated_at
  before update on public.range_sessions
  for each row execute function private.set_updated_at();

-- Keep the firearm's barrel round count in sync with session rounds_fired.
create function private.apply_rounds_fired_delta()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  delta int;
begin
  if tg_op = 'INSERT' then
    delta := new.rounds_fired;
  elsif tg_op = 'UPDATE' then
    delta := new.rounds_fired - old.rounds_fired;
  else
    delta := -old.rounds_fired;
  end if;
  if delta <> 0 then
    update public.firearms
    set barrel_round_count = greatest(0, barrel_round_count + delta)
    where id = coalesce(new.firearm_id, old.firearm_id);
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke execute on function private.apply_rounds_fired_delta()
  from public, anon, authenticated;

create trigger range_sessions_rounds_delta
  after insert or update or delete on public.range_sessions
  for each row execute function private.apply_rounds_fired_delta();

-- ============================================================= shot_strings

create table public.shot_strings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_id uuid not null references public.range_sessions (id) on delete cascade,
  label text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shot_strings_user_id_idx on public.shot_strings (user_id);
create index shot_strings_session_id_idx on public.shot_strings (session_id);

alter table public.shot_strings enable row level security;

create policy "shot_strings_select_own"
  on public.shot_strings for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "shot_strings_insert_own"
  on public.shot_strings for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "shot_strings_update_own"
  on public.shot_strings for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "shot_strings_delete_own"
  on public.shot_strings for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger shot_strings_set_updated_at
  before update on public.shot_strings
  for each row execute function private.set_updated_at();

-- ==================================================================== shots

create table public.shots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  string_id uuid not null references public.shot_strings (id) on delete cascade,
  seq int not null check (seq > 0),
  velocity_mps numeric not null check (velocity_mps > 0),
  velocity_input text,
  created_at timestamptz not null default now()
);

create index shots_user_id_idx on public.shots (user_id);
create index shots_string_id_idx on public.shots (string_id);

alter table public.shots enable row level security;

create policy "shots_select_own"
  on public.shots for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "shots_insert_own"
  on public.shots for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "shots_update_own"
  on public.shots for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "shots_delete_own"
  on public.shots for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ======================================================== shot_string_stats

-- Stats are computed, never stored; security_invoker keeps RLS of the caller.
create view public.shot_string_stats
with (security_invoker = on) as
select
  string_id,
  count(*)::int as n,
  avg(velocity_mps) as avg_mps,
  max(velocity_mps) - min(velocity_mps) as es_mps,
  stddev_samp(velocity_mps) as sd_mps,
  min(velocity_mps) as min_mps,
  max(velocity_mps) as max_mps
from public.shots
group by string_id;

-- ========================================================== storage: targets

insert into storage.buckets (id, name, public)
values ('targets', 'targets', false)
on conflict (id) do nothing;

-- Path convention: {user_id}/{session_id}/{uuid}.jpg — owner-scoped access.
create policy "targets_select_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'targets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "targets_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'targets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "targets_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'targets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "targets_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'targets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
