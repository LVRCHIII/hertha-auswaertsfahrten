-- Fix: bericht_bilder.fahrt_id soll auf fahrten zeigen, nicht auf spieltagsberichte
-- Bilder sollen auch hochladbar sein bevor ein Bericht gespeichert wurde

alter table public.bericht_bilder
  drop constraint bericht_bilder_fahrt_id_fkey;

alter table public.bericht_bilder
  add constraint bericht_bilder_fahrt_id_fkey
  foreign key (fahrt_id) references public.fahrten(id) on delete cascade;
