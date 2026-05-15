-- Abstimmung auf Abfahrtszeit (15-Minuten-Slots am Treffpunkt)
create table public.abfahrt_abstimmungen (
  fahrt_id uuid not null references public.fahrten (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  abfahrt_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (fahrt_id, user_id)
);

create index abfahrt_abstimmungen_fahrt_id_idx on public.abfahrt_abstimmungen (fahrt_id);

alter table public.abfahrt_abstimmungen enable row level security;

create policy "abfahrt_abstimmungen_select_authenticated"
  on public.abfahrt_abstimmungen
  for select
  to authenticated
  using (true);

create policy "abfahrt_abstimmungen_insert_own"
  on public.abfahrt_abstimmungen
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "abfahrt_abstimmungen_update_own"
  on public.abfahrt_abstimmungen
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "abfahrt_abstimmungen_delete_own"
  on public.abfahrt_abstimmungen
  for delete
  to authenticated
  using (auth.uid() = user_id);
