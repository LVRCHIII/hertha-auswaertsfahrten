import { mapMitfahrerError } from './mapSocialError'
import { requireSupabase } from './supabase'
import type { AbfahrtAbstimmung } from '../types/abfahrt'

function mapRows(rows: Record<string, unknown>[]): AbfahrtAbstimmung[] {
  return rows.map((row) => ({
    fahrt_id: row.fahrt_id as string,
    user_id: row.user_id as string,
    abfahrt_at: row.abfahrt_at as string,
    created_at: row.created_at as string,
  }))
}

export async function fetchAbfahrtAbstimmungen(
  fahrtId: string,
): Promise<{ data: AbfahrtAbstimmung[] | null; error: string | null }> {
  const { data, error } = await requireSupabase()
    .from('abfahrt_abstimmungen')
    .select('fahrt_id, user_id, abfahrt_at, created_at')
    .eq('fahrt_id', fahrtId)

  if (error) {
    console.error('Abfahrt-Abstimmungen laden fehlgeschlagen:', error)
    return { data: null, error: mapMitfahrerError(error) }
  }

  return { data: mapRows(data ?? []), error: null }
}

export async function fetchAbfahrtAbstimmungenForFahrten(
  fahrtIds: string[],
): Promise<{ data: Map<string, AbfahrtAbstimmung[]> | null; error: string | null }> {
  if (fahrtIds.length === 0) {
    return { data: new Map(), error: null }
  }

  const { data, error } = await requireSupabase()
    .from('abfahrt_abstimmungen')
    .select('fahrt_id, user_id, abfahrt_at, created_at')
    .in('fahrt_id', fahrtIds)

  if (error) {
    console.error('Abfahrt-Abstimmungen (Übersicht) laden fehlgeschlagen:', error)
    return { data: null, error: mapMitfahrerError(error) }
  }

  const byFahrt = new Map<string, AbfahrtAbstimmung[]>()
  for (const row of mapRows(data ?? [])) {
    const list = byFahrt.get(row.fahrt_id) ?? []
    list.push(row)
    byFahrt.set(row.fahrt_id, list)
  }

  return { data: byFahrt, error: null }
}

export async function setAbfahrtVote(
  fahrtId: string,
  userId: string,
  abfahrtAt: Date,
): Promise<{ error: string | null }> {
  const { error } = await requireSupabase().from('abfahrt_abstimmungen').upsert(
    {
      fahrt_id: fahrtId,
      user_id: userId,
      abfahrt_at: abfahrtAt.toISOString(),
    },
    { onConflict: 'fahrt_id,user_id' },
  )

  if (error) {
    console.error('Abfahrt-Stimme speichern fehlgeschlagen:', error)
    return { error: mapMitfahrerError(error) }
  }

  return { error: null }
}

export async function removeAbfahrtVote(
  fahrtId: string,
  userId: string,
): Promise<{ error: string | null }> {
  const { error } = await requireSupabase()
    .from('abfahrt_abstimmungen')
    .delete()
    .eq('fahrt_id', fahrtId)
    .eq('user_id', userId)

  if (error) {
    console.error('Abfahrt-Stimme entfernen fehlgeschlagen:', error)
    return { error: mapMitfahrerError(error) }
  }

  return { error: null }
}
