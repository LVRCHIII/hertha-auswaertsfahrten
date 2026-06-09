-- Milestone: Separate Bildergalerie für Spieltagsberichte
create table public.bericht_bilder (
  id          uuid        primary key default gen_random_uuid(),
  fahrt_id    uuid        not null references public.spieltagsberichte(fahrt_id) on delete cascade,
  uploaded_by uuid        not null references auth.users(id) on delete cascade,
  path        text        not null,
  url         text        not null,
  position    integer     not null default 0,
  created_at  timestamptz not null default now()
);

create index bericht_bilder_fahrt_id_idx on public.bericht_bilder (fahrt_id);

alter table public.bericht_bilder enable row level security;

create policy "bericht_bilder_select"
  on public.bericht_bilder for select
  to authenticated
  using (true);

create policy "bericht_bilder_insert"
  on public.bericht_bilder for insert
  to authenticated
  with check (uploaded_by = auth.uid());

create policy "bericht_bilder_delete"
  on public.bericht_bilder for delete
  to authenticated
  using (uploaded_by = auth.uid());
