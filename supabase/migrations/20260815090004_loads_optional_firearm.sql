-- 004_loads_optional_firearm — a load is defined by its cartridge (caliber is
-- required); the firearm is optional context. A firearm chambered for two
-- cartridges (.357 Magnum / .38 Special) can carry loads of either, but each
-- load names exactly one cartridge. Additive change; no data affected.

alter table public.loads
  alter column firearm_id drop not null;
