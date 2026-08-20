-- 010_loads_purpose — what the load is being developed for (multi-select,
-- e.g. precision, low recoil). Additive; no data affected.

alter table public.loads
  add column purpose text[] not null default '{}';
