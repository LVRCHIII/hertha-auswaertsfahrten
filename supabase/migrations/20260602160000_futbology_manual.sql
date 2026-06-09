-- M23: source-Spalte für futbology_spiele + update-Policy für manuelle Einträge

alter table public.futbology_spiele
  add column if not exists source text not null default 'csv'
    check (source in ('csv', 'manual'));

-- Manuelle Einträge können bearbeitet werden
create policy "futbology_update_own"
  on public.futbology_spiele for update
  to authenticated using (auth.uid() = user_id);
