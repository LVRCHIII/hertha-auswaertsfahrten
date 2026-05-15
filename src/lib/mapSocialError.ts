import type { PostgrestError } from '@supabase/supabase-js'

function baseMessage(error: PostgrestError, fallback: string): string {
  const code = error.code ?? ''
  const message = error.message ?? ''

  if (code === '42P01') {
    return (
      'Die Datenbank-Tabellen für Milestone 3 fehlen. Führe die Migration aus ' +
      '(supabase/migrations/20250516120000_milestone3_social.sql).'
    )
  }

  if (code === '42501' || message.toLowerCase().includes('row-level security')) {
    return 'Keine Berechtigung für diese Aktion. Bitte erneut anmelden.'
  }

  if (code === '23505') {
    return 'Du bist bereits als Mitfahrer eingetragen.'
  }

  return `${fallback} (${message || code || 'Unbekannter Fehler'})`
}

export function mapMitfahrerError(error: PostgrestError): string {
  return baseMessage(error, 'Mitfahrer-Aktion fehlgeschlagen')
}

export function mapMitbringError(error: PostgrestError): string {
  return baseMessage(error, 'Mitbringliste-Aktion fehlgeschlagen')
}

export function mapProfileError(error: PostgrestError): string {
  return baseMessage(error, 'Profil konnte nicht gespeichert werden')
}
