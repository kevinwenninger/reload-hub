-- 012_ladder_tests — a ladder is a version kind with a charge RANGE instead
-- of a single charge (charge_mg = start). Steps are derived arithmetic on
-- owner-entered bounds — the app still never suggests charges. Shot strings
-- can carry the charge they were fired with, so per-step stats fall out of
-- the existing string statistics. Additive; no data affected.

alter table public.load_versions
  add column kind text not null default 'single'
    check (kind in ('single', 'ladder')),
  add column charge_end_mg numeric check (charge_end_mg > 0),
  add column charge_end_input text,
  add column charge_step_mg numeric check (charge_step_mg > 0),
  add column charge_step_input text;

alter table public.shot_strings
  add column charge_mg numeric check (charge_mg > 0),
  add column charge_input text;
