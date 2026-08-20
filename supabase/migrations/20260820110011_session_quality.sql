-- 011_session_quality — range sessions grade the load, not the range trip:
-- angular group size (canonical MOA + raw input), malfunction counts
-- ({"failure_to_fire": 1, ...}). Distance stays but becomes optional context.
-- Additive; no data affected.

alter table public.range_sessions
  add column group_angle_moa numeric check (group_angle_moa > 0),
  add column group_angle_input text,
  add column malfunctions jsonb not null default '{}'
    check (jsonb_typeof(malfunctions) = 'object');
