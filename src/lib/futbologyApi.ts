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
    profile: normalizeProfile(row.profile as ProfileJoin),
  }))

  return { data: mapped, error: null }
}

export async function replaceFutbologySpiele(
  userId: string,
  rows: ParsedCsvRow[],
): Promise<{ count: number; error: string | null }> {
  const sb = requireSupabase()

  const { error: deleteError } = await sb
    .from('futbology_spiele')
    .delete()
    .eq('user_id', userId)

  if (deleteError) return { count: 0, error: deleteError.message }
  if (rows.length === 0) return { count: 0, error: null }

  const { error: insertError } = await sb
    .from('futbology_spiele')
    .insert(rows.map((row) => ({ ...row, user_id: userId })))

  if (insertError) return { count: 0, error: insertError.message }
  return { count: rows.length, error: null }
}
