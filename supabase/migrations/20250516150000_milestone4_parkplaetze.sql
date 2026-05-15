-- Milestone 4: Parkplätze pro Fahrt (Google Places + manuell, einer gewählt)

create table public.parkplaetze (
  id uuid primary key default gen_random_uuid(),
  fahrt_id uuid not null references public.fahrten (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  address text not null check (char_length(trim(address)) > 0),
  place_id text,
  lat double precision,
  lng double precision,
  source text not null default 'manual' check (source in ('google', 'manual')),
  is_selected boolean not null default false,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index parkplaetze_fahrt_id_idx on public.parkplaetze (fahrt_id);

-- Höchstens ein gewählter Parkplatz pro Fahrt
create unique index parkplaetze_one_selected_per_fahrt
  on public.parkplaetze (fahrt_id)
  where (is_selected);

alter table public.parkplaetze enable row level security;

create policy "parkplaetze_select_authenticated"
  on public.parkplaetze
  for select
  to authenticated
  using (true);

create policy "parkplaetze_insert_authenticated"
  on public.parkplaetze
  for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "parkplaetze_update_authenticated"
  on public.parkplaetze
  for update
  to authenticated
  using (true)
  with check (true);

create policy "parkplaetze_delete_authenticated"
  on public.parkplaetze
  for delete
  to authenticated
  using (true);
