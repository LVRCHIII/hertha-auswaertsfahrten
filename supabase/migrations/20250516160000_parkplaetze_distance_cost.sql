-- Entfernung zum Stadion + Kosteninfo (aus Google Places)

alter table public.parkplaetze
  add column if not exists distance_meters integer,
  add column if not exists cost_kind text check (cost_kind in ('free', 'paid', 'mixed', 'unknown'));
