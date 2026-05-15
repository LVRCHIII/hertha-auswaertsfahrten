-- Milestone 1: Fahrten-Tabelle für Kalenderübersicht & Anlegen
create table public.fahrten (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users (id) on delete cascade,
  gegner text not null,
  stadion text not null,
  spiel_at timestamptz not null,
  startpunkt text not null default 'Berlin',
  notizen text,
  treffpunkt_berlin text
);

create index fahrten_spiel_at_idx on public.fahrten (spiel_at);

alter table public.fahrten enable row level security;

-- Kleine geschlossene Gruppe: alle eingeloggten Nutzer sehen und bearbeiten Fahrten
create policy "fahrten_select_authenticated"
  on public.fahrten
  for select
  to authenticated
  using (true);

create policy "fahrten_insert_authenticated"
  on public.fahrten
  for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "fahrten_update_authenticated"
  on public.fahrten
  for update
  to authenticated
  using (true)
  with check (true);

-- Löschen nur durch Ersteller:in
create policy "fahrten_delete_creator"
  on public.fahrten
  for delete
  to authenticated
  using (auth.uid() = created_by);
