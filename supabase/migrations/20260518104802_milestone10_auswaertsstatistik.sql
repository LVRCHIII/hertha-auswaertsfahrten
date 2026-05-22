-- Milestone 10: dauerhaft gespeicherte Routendistanz für Auswärtsstatistiken

alter table public.fahrten
  add column route_distance_meters integer
  check (route_distance_meters is null or route_distance_meters > 0);

comment on column public.fahrten.route_distance_meters is
  'Gespeicherte Google-Maps-Routendistanz in Metern für Statistik und Ranking.';
