import { requireSupabase } from './supabase'
import { mapFahrtDeleteError, mapFahrtError } from './mapSupabaseError'
import type { FahrtInsert } from '../types/fahrt'

export async function insertFahrt(payload: FahrtInsert): Promise<{ error: string | null }> {
  const { error } = await requireSupabase().from('fahrten').insert(payload)

  if (error) {
    console.error('Fahrt speichern fehlgeschlagen:', error)
    return { error: mapFahrtError(error) }
  }

  return { error: null }
}

export async function deleteFahrt(id: string): Promise<{ error: string | null }> {
  const { error } = await requireSupabase().from('fahrten').delete().eq('id', id)

  if (error) {
    console.error('Fahrt löschen fehlgeschlagen:', error)
    return { error: mapFahrtDeleteError(error) }
  }

  return { error: null }
}
