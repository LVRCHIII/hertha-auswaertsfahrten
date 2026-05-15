-- PostgREST braucht FK user_id → profiles für Profil-Embeds

alter table public.mitfahrer
  drop constraint mitfahrer_user_id_fkey,
  add constraint mitfahrer_user_id_fkey
    foreign key (user_id) references public.profiles (id) on delete cascade;

alter table public.mitbringliste
  drop constraint mitbringliste_user_id_fkey,
  add constraint mitbringliste_user_id_fkey
    foreign key (user_id) references public.profiles (id) on delete cascade;
