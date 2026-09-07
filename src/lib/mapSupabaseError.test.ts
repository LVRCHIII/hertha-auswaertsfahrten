import type { PostgrestError } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import { mapFahrtError } from './mapSupabaseError'

function createError(code: string, message: string): PostgrestError {
  return { code, message, details: '', hint: '' } as PostgrestError
}

describe('mapFahrtError', () => {
  it('verweist bei fehlender OpenLigaDB-Spalte auf die richtige Migration', () => {
    expect(mapFahrtError(createError(
      '42703',
      'column fahrten.openliga_match_id does not exist',
    ))).toContain('20260715150000_openliga_match_id.sql')
  })

  it('erklärt einen Unique-Konflikt als bereits vorhandenes Spiel', () => {
    expect(mapFahrtError(createError(
      '23505',
      'duplicate key value violates unique constraint fahrten_openliga_match_id_uidx',
    ))).toBe('Dieses OpenLigaDB-Spiel ist bereits als Fahrt vorhanden.')
  })
})
