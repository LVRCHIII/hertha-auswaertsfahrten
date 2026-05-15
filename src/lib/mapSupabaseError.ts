import type { PostgrestError } from '@supabase/supabase-js'

export function mapFahrtError(error: PostgrestError): string {
  const code = error.code ?? ''
  const message = error.message ?? ''

  if (code === '42P01' || (message.includes('fahrten') && message.includes('does not exist'))) {
    return (
      'Die Datenbank-Tabelle „fahrten“ fehlt. Führe die Migration in Supabase aus ' +
      '(SQL Editor → Datei supabase/migrations/20250515120000_create_fahrten.sql).'
    )
  }

  if (code === '42501' || message.toLowerCase().includes('row-level security')) {
    return 'Keine Berechtigung zum Speichern. Bitte erneut anmelden.'
  }

  if (code === '23503') {
    return 'Sitzung ungültig. Bitte abmelden und erneut anmelden.'
  }

  return `Fahrt konnte nicht gespeichert werden. (${message || code || 'Unbekannter Fehler'})`
}
