-- Milestone 3: Mitfahrer, Mitbringliste, Profile

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_authenticated"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Profil beim Registrieren anlegen (Anzeigename aus E-Mail-Präfix)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Mitfahrer: wer fährt mit?
create table public.mitfahrer (
  fahrt_id uuid not null references public.fahrten (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (fahrt_id, user_id)
);

create index mitfahrer_fahrt_id_idx on public.mitfahrer (fahrt_id);

alter table public.mitfahrer enable row level security;

create policy "mitfahrer_select_authenticated"
  on public.mitfahrer
  for select
  to authenticated
  using (true);

create policy "mitfahrer_insert_own"
  on public.mitfahrer
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "mitfahrer_delete_own"
  on public.mitfahrer
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Mitbringliste: wer bringt was mit?
create table public.mitbringliste (
  id uuid primary key default gen_random_uuid(),
  fahrt_id uuid not null references public.fahrten (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  item text not null check (char_length(trim(item)) > 0),
  created_at timestamptz not null default now()
);

create index mitbringliste_fahrt_id_idx on public.mitbringliste (fahrt_id);

alter table public.mitbringliste enable row level security;

create policy "mitbringliste_select_authenticated"
  on public.mitbringliste
  for select
  to authenticated
  using (true);

create policy "mitbringliste_insert_own"
  on public.mitbringliste
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "mitbringliste_delete_own"
  on public.mitbringliste
  for delete
  to authenticated
  using (auth.uid() = user_id);
