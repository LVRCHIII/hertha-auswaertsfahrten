import { requireSupabase } from './supabase'
import type { FutbologySpiel, ParsedCsvRow } from '../types/futbology'

type ProfileJoin = { display_name: string; avatar_url: string | null } | { display_name: string; avatar_url: string | null }[] | null

function normalizeProfile(p: ProfileJoin) {
  if (!p) return null
  if (Array.isArray(p)) return p[0] ?? null
  return p
}

export async function fetchAllFutbologySpiele(): Promise<{
  data: FutbologySpiel[]
  error: string | null
}> {
  const { data, error } = await requireSupabase()
    .from('futbology_spiele')
    .select(
      'id, user_id, datum, stadion, heim_team, gast_team, ergebnis, liga, created_at, profile:profiles!futbology_spiele_user_id_fkey(display_name, avatar_url)',
    )
    .order('datum', { ascending: false })

  if (error) return { data: [], error: error.message }

  const mapped: FutbologySpiel[] = (data ?? []).map((row) => ({
    ...(row as Omit<typeof row, 'profile'>),
    source: ((row as Record<string, unknown>).source as 'csv' | 'manual') ?? 'csv',
    profile: normalizeProfile(row.profile as ProfileJoin),
  }))

  return { data: mapped, error: null }
}

export async function replaceFutbologySpiele(
  userId: string,
  rows: ParsedCsvRow[],
): Promise<{ count: number; error: string | null }> {
  const sb = requireSupabase()

  // Nur CSV-Einträge löschen, manuelle Einträge bleiben erhalten
  const { error: deleteError } = await sb
    .from('futbology_spiele')
    .delete()
    .eq('user_id', userId)
    .eq('source', 'csv')

  if (deleteError) return { count: 0, error: deleteError.message }
  if (rows.length === 0) return { count: 0, error: null }

  const { error: insertError } = await sb
    .from('futbology_spiele')
    .insert(rows.map((row) => ({ ...row, user_id: userId, source: 'csv' })))

  if (insertError) return { count: 0, error: insertError.message }
  return { count: rows.length, error: null }
}

export type ManuellerSpielEintrag = {
  datum: string
  heim_team: string
  gast_team: string
  stadion: string
  ergebnis: string | null
  liga: string | null
}

export async function insertFutbologySpielManuell(
  userId: string,
  spiel: ManuellerSpielEintrag,
): Promise<{ error: string | null }> {
  const { error } = await requireSupabase()
    .from('futbology_spiele')
    .insert({ ...spiel, user_id: userId, source: 'manual' })

  if (error) return { error: error.message }
  return { error: null }
}

export async function deleteFutbologySpiel(
  id: string,
): Promise<{ error: string | null }> {
  const { error } = await requireSupabase()
    .from('futbology_spiele')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  return { error: null }
}
