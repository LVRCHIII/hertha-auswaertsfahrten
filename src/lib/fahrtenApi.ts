import { requireSupabase } from './supabase'
import { mapFahrtError } from './mapSupabaseError'
import type { FahrtInsert } from '../types/fahrt'

export async function insertFahrt(payload: FahrtInsert): Promise<{ error: string | null }> {
  const { error } = await requireSupabase().from('fahrten').insert(payload)

  if (error) {
    console.error('Fahrt speichern fehlgeschlagen:', error)
    return { error: mapFahrtError(error) }
  }

  return { error: null }
}
