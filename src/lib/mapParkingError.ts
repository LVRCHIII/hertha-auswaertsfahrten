import type { PostgrestError } from '@supabase/supabase-js'

function baseMessage(error: PostgrestError, fallback: string): string {
  const code = error.code ?? ''
  const message = error.message ?? ''

  if (
    code === '42P01' ||
    code === 'PGRST205' ||
    code === 'PGRST116' ||
    message.includes('parkplaetze') ||
    message.toLowerCase().includes('does not exist')
  ) {
    return (
      'Die Tabelle „parkplaetze“ fehlt in Supabase. Im SQL Editor ausführen: ' +
      'supabase/migrations/20250516150000_milestone4_parkplaetze.sql'
    )
  }

  if (message.includes('distance_meters') || message.includes('cost_kind')) {
    return (
      'Parkplatz-Spalten fehlen. Im SQL Editor ausführen: ' +
      'supabase/migrations/20250516160000_parkplaetze_distance_cost.sql'
    )
  }

  if (code === '42501' || message.toLowerCase().includes('row-level security')) {
    return 'Keine Berechtigung für diese Aktion. Bitte erneut anmelden.'
  }

  if (code === '23505') {
    return 'Es ist bereits ein Parkplatz als gewählt markiert.'
  }

  return `${fallback} (${message || code || 'Unbekannter Fehler'})`
}

export function mapParkingError(error: PostgrestError): string {
  return baseMessage(error, 'Parkplatz-Aktion fehlgeschlagen')
}
