-- Heimspiele: fahrten-Tabelle um Auswärts-/Heim-Unterscheidung erweitern.
-- Heimspiele nutzen dieselbe Tabelle (und damit dieselben Spieltagsberichte/Fotos),
-- verzichten in der UI aber auf Route/Abfahrt/Mitfahrer/Mitbringliste/Parkplatz.

alter table public.fahrten
  add column typ text not null default 'auswaerts';

alter table public.fahrten
  add constraint fahrten_typ_check check (typ in ('auswaerts', 'heim'));
