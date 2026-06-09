-- Milestone 20: Spieltagsbewertungen + Spielinfo auf spieltagsberichte

alter table public.spieltagsberichte
  add column ergebnis_heim  smallint   check (ergebnis_heim  >= 0),
  add column ergebnis_gast  smallint   check (ergebnis_gast  >= 0),
  add column zuschauer      integer    check (zuschauer      >= 0),
  add column bewertung_spiel        smallint check (bewertung_spiel        between 1 and 5),
  add column bewertung_atmosphaere  smallint check (bewertung_atmosphaere  between 1 and 5),
  add column bewertung_pommes       smallint check (bewertung_pommes       between 1 and 5);
