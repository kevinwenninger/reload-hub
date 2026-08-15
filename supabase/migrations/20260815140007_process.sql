-- 007_process — process_templates (+ 3 system templates: generic manufacturer
-- workflow, NO die settings, NO load data), checklist_runs, and the
-- complete_checklist_run RPC (marks done, deducts inventory lots, logs a
-- loaded batch — one transaction).

-- ======================================================== process_templates

create table public.process_templates (
  id uuid primary key default gen_random_uuid(),
  -- null = system template (read-only for users; forkable)
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  description text,
  -- ordered array of { id, title, description, optional }
  steps jsonb not null default '[]' check (jsonb_typeof(steps) = 'array'),
  forked_from uuid references public.process_templates (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index process_templates_user_id_idx on public.process_templates (user_id);

alter table public.process_templates enable row level security;

-- Everyone signed in reads system templates + their own.
create policy "process_templates_select"
  on public.process_templates for select to authenticated
  using (user_id is null or (select auth.uid()) = user_id);

create policy "process_templates_insert_own"
  on public.process_templates for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "process_templates_update_own"
  on public.process_templates for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "process_templates_delete_own"
  on public.process_templates for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger process_templates_set_updated_at
  before update on public.process_templates
  for each row execute function private.set_updated_at();

-- ----------------------------------------------------------- system seeds
-- Generic sequence as published by die/press manufacturers. Deliberately no
-- die settings, measurements or charges — those are the user's own data.

insert into public.process_templates (id, user_id, name, description, steps) values
(
  '00000000-0000-4000-8000-000000000001', null,
  'Bottleneck rifle (full-length sizing)',
  'Generic sequence for bottleneck rifle cartridges with full-length sizing.',
  '[
    {"id":"clean","title":"Clean & inspect cases","description":"Tumble or wash, then inspect for cracks, splits, loose primer pockets and incipient head separation. Discard anything doubtful.","optional":false},
    {"id":"lube","title":"Lubricate cases","description":"Apply a thin, even film of case lube; avoid the shoulder area to prevent dents.","optional":false},
    {"id":"size","title":"Full-length size & decap","description":"Run each case through the sizing die per the die manufacturer''s instructions. Deprime in the same stroke.","optional":false},
    {"id":"trim","title":"Trim, chamfer & deburr","description":"Check case length against the manual''s trim-to length; trim as needed, then chamfer inside and deburr outside the mouth.","optional":false},
    {"id":"pocket","title":"Clean primer pockets","description":"Clean pockets and check flash holes for burrs or obstructions.","optional":true},
    {"id":"delube","title":"Remove lube","description":"Wipe or tumble off sizing lube.","optional":false},
    {"id":"prime","title":"Prime","description":"Seat primers fully and evenly, flush or slightly below the case head. Check each one by feel and eye.","optional":false},
    {"id":"charge","title":"Charge with powder","description":"Weigh each charge from your own recorded load data. Verify visually that every case holds one charge — no empties, no doubles.","optional":false},
    {"id":"seat","title":"Seat bullets","description":"Seat to your recorded COAL/CBTO. Measure the first rounds and spot-check throughout.","optional":false},
    {"id":"crimp","title":"Crimp","description":"Only if your recipe calls for it.","optional":true},
    {"id":"inspect","title":"Final inspection & record","description":"Check every round (primer seated, no visible defects, length in spec), then log the batch.","optional":false}
  ]'
),
(
  '00000000-0000-4000-8000-000000000002', null,
  'Straight-wall pistol (3-die, taper crimp)',
  'Generic sequence for straight-wall pistol cartridges using a 3-die set with taper crimp.',
  '[
    {"id":"clean","title":"Clean & inspect cases","description":"Clean brass, inspect for cracks, splits and bulges. Discard doubtful cases.","optional":false},
    {"id":"size","title":"Size & decap","description":"Carbide dies usually need no lube. Size and deprime per the die manufacturer''s instructions.","optional":false},
    {"id":"expand","title":"Expand / bell case mouth","description":"Bell the mouth just enough to start the bullet without shaving.","optional":false},
    {"id":"prime","title":"Prime","description":"Seat primers fully and evenly; check by feel and eye.","optional":false},
    {"id":"charge","title":"Charge with powder","description":"Throw or weigh charges from your own recorded load data. Look into every case before seating — no empties, no doubles.","optional":false},
    {"id":"seat","title":"Seat bullets","description":"Seat to your recorded COAL; measure the first rounds and spot-check.","optional":false},
    {"id":"crimp","title":"Taper crimp","description":"Remove the bell and apply a light taper crimp per your recipe.","optional":false},
    {"id":"gauge","title":"Case gauge / plunk test","description":"Drop rounds into a case gauge or the barrel to confirm they chamber freely.","optional":true},
    {"id":"inspect","title":"Final inspection & record","description":"Check every round, then log the batch.","optional":false}
  ]'
),
(
  '00000000-0000-4000-8000-000000000003', null,
  'Straight-wall revolver (3-die, roll crimp)',
  'Generic sequence for straight-wall revolver cartridges using a 3-die set with roll crimp.',
  '[
    {"id":"clean","title":"Clean & inspect cases","description":"Clean brass, inspect for cracks, splits and thin mouths. Discard doubtful cases.","optional":false},
    {"id":"size","title":"Size & decap","description":"Carbide dies usually need no lube. Size and deprime per the die manufacturer''s instructions.","optional":false},
    {"id":"trim","title":"Check length / trim","description":"Uniform case length matters for a consistent roll crimp — check and trim as needed.","optional":true},
    {"id":"expand","title":"Expand / bell case mouth","description":"Bell the mouth just enough to start the bullet without shaving.","optional":false},
    {"id":"prime","title":"Prime","description":"Seat primers fully and evenly; check by feel and eye.","optional":false},
    {"id":"charge","title":"Charge with powder","description":"Throw or weigh charges from your own recorded load data. Look into every case before seating — no empties, no doubles.","optional":false},
    {"id":"seat","title":"Seat bullets","description":"Seat to the cannelure / your recorded COAL; measure the first rounds and spot-check.","optional":false},
    {"id":"crimp","title":"Roll crimp","description":"Apply a roll crimp into the cannelure per your recipe.","optional":false},
    {"id":"inspect","title":"Final inspection & record","description":"Check every round, then log the batch.","optional":false}
  ]'
);

-- =========================================================== checklist_runs

create table public.checklist_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  template_id uuid references public.process_templates (id) on delete set null,
  -- steps copied at start so later template edits don't change a run
  template_name text not null,
  template_snapshot jsonb not null check (jsonb_typeof(template_snapshot) = 'array'),
  load_version_id uuid not null references public.load_versions (id) on delete cascade,
  batch_size int not null check (batch_size > 0),
  -- { [stepId]: { done_at: timestamptz | null } }
  steps_state jsonb not null default '{}' check (jsonb_typeof(steps_state) = 'object'),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  loaded_batch_id uuid references public.loaded_batches (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index checklist_runs_user_id_idx on public.checklist_runs (user_id);
create index checklist_runs_load_version_id_idx
  on public.checklist_runs (load_version_id);

alter table public.checklist_runs enable row level security;

create policy "checklist_runs_select_own"
  on public.checklist_runs for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "checklist_runs_insert_own"
  on public.checklist_runs for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "checklist_runs_update_own"
  on public.checklist_runs for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "checklist_runs_delete_own"
  on public.checklist_runs for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger checklist_runs_set_updated_at
  before update on public.checklist_runs
  for each row execute function private.set_updated_at();

-- ==================================================== complete_checklist_run

-- Marks the run complete, deducts referenced lots (bullet/primer/case: −batch;
-- powder: −batch × charge in grams), and logs a loaded batch. One transaction.
create function public.complete_checklist_run(p_run_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_run public.checklist_runs%rowtype;
  v_version public.load_versions%rowtype;
  v_batch_id uuid;
  v_powder_g numeric;
begin
  select * into v_run from public.checklist_runs
  where id = p_run_id and user_id = (select auth.uid());
  if not found then
    raise exception 'checklist run not found';
  end if;
  if v_run.completed_at is not null then
    return v_run.loaded_batch_id;
  end if;

  select * into v_version from public.load_versions where id = v_run.load_version_id;
  if not found then
    raise exception 'load version not found';
  end if;

  -- pieces: bullet, primer, case
  update public.inventory_lots
  set qty_remaining = greatest(0, qty_remaining - v_run.batch_size)
  where id in (v_version.bullet_lot_id, v_version.primer_lot_id, v_version.case_lot_id)
    and user_id = v_run.user_id;

  -- powder in grams (charge stored canonically in mg)
  if v_version.powder_lot_id is not null and v_version.charge_mg is not null then
    v_powder_g := (v_run.batch_size * v_version.charge_mg) / 1000.0;
    update public.inventory_lots
    set qty_remaining = greatest(0, qty_remaining - v_powder_g)
    where id = v_version.powder_lot_id and user_id = v_run.user_id;
  end if;

  insert into public.loaded_batches (user_id, load_version_id, date, qty, qty_remaining, notes)
  values (v_run.user_id, v_run.load_version_id, current_date, v_run.batch_size,
          v_run.batch_size, v_run.template_name)
  returning id into v_batch_id;

  update public.checklist_runs
  set completed_at = now(), loaded_batch_id = v_batch_id
  where id = p_run_id;

  return v_batch_id;
end;
$$;

revoke execute on function public.complete_checklist_run(uuid) from public, anon;
grant execute on function public.complete_checklist_run(uuid) to authenticated;
