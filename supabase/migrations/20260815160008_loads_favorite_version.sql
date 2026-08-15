-- 008_loads_favorite_version — the load-development sweet spot: the version
-- the user settles on. Additive; no data affected.

alter table public.loads
  add column favorite_version_id uuid
    references public.load_versions (id) on delete set null;
