-- 005_load_versions_rounds_loaded — how many rounds were assembled from a
-- version (owner-entered; checklist runs will add to it in phase 4).
-- Additive change; no data affected.

alter table public.load_versions
  add column rounds_loaded int not null default 0 check (rounds_loaded >= 0);
