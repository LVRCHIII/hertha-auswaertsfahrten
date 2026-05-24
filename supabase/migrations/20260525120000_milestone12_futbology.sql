-- Milestone 12: Futbology-CSV-Import — besuchte Spiele pro User

create table public.futbology_spiele (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null
                constraint futbology_spiele_user_id_fkey
                references public.profiles (id) on delete cascade,
  datum       date        not null,
  stadion     text        not null default '',
  heim_team   text        not null,
  gast_team   text        not null,
  ergebnis    text,
  liga        text,
  created_at  timestamptz not null default now()
);

create index futbology_spiele_user_id_idx on public.futbology_spiele (user_id);
create index futbology_spiele_datum_idx   on public.futbology_spiele (datum desc);

alter table public.futbology_spiele enable row level security;

create policy "futbology_select_authenticated"
  on public.futbology_spiele for select
  to authenticated using (true);

create policy "futbology_insert_own"
  on public.futbology_spiele for insert
  to authenticated with check (auth.uid() = user_id);

create policy "futbology_delete_own"
  on public.futbology_spiele for delete
  to authenticated using (auth.uid() = user_id);
