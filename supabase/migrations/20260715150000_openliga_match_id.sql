-- OpenLigaDB-Spiele dauerhaft einer Fahrt zuordnen.
-- NULL bleibt für manuell oder über ältere Quellen angelegte Fahrten erlaubt.
alter table public.fahrten
  add column if not exists openliga_match_id bigint;

create unique index if not exists fahrten_openliga_match_id_uidx
  on public.fahrten (openliga_match_id)
  where openliga_match_id is not null;
