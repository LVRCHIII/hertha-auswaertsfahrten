-- Treffpunkt muss bestätigt werden, bevor er in der Kalenderübersicht sichtbar ist
alter table public.fahrten
  add column if not exists treffpunkt_bestaetigt boolean not null default false;

comment on column public.fahrten.treffpunkt_bestaetigt is
  'true = Treffpunkt ist für alle in der Übersicht sichtbar';
