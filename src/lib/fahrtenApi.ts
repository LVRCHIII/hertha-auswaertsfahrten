import { supabase } from './supabase'
import type { FahrtInsert } from '../types/fahrt'

export async function insertFahrt(payload: FahrtInsert): Promise<{ error: string | null }> {
  const { error } = await supabase.from('fahrten').insert(payload)

  if (error) {
    return { error: 'Fahrt konnte nicht gespeichert werden.' }
  }

  return { error: null }
}
