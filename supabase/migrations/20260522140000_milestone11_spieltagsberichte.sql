-- Milestone 11: Spieltagsberichte mit strukturiertem JSON und Berichtbildern

create table public.spieltagsberichte (
  fahrt_id uuid primary key references public.fahrten (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content_json jsonb not null default '{}'::jsonb,
  content_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index spieltagsberichte_author_id_idx on public.spieltagsberichte (author_id);

alter table public.spieltagsberichte enable row level security;

create policy "spieltagsberichte_select_authenticated"
  on public.spieltagsberichte
  for select
  to authenticated
  using (true);

create policy "spieltagsberichte_insert_own"
  on public.spieltagsberichte
  for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "spieltagsberichte_update_own"
  on public.spieltagsberichte
  for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "spieltagsberichte_delete_own"
  on public.spieltagsberichte
  for delete
  to authenticated
  using (auth.uid() = author_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bericht-images',
  'bericht-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "bericht_images_public_read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'bericht-images');

create policy "bericht_images_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'bericht-images'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "bericht_images_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'bericht-images'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "bericht_images_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'bericht-images'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
