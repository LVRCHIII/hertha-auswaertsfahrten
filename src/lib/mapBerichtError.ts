import type { PostgrestError } from '@supabase/supabase-js'

export function mapBerichtError(error: PostgrestError): string {
  const code = error.code ?? ''
  const message = error.message ?? ''

  if (
    code === '42P01' ||
    (message.includes('spieltagsberichte') && message.includes('does not exist'))
  ) {
    return (
      'Die Tabelle für Spieltagsberichte fehlt. Führe die Migration aus ' +
      '(supabase/migrations/20260522140000_milestone11_spieltagsberichte.sql).'
    )
  }

  if (code === '23505') {
    return 'Für diese Fahrt gibt es bereits einen Bericht.'
  }

  if (code === '42501' || message.toLowerCase().includes('row-level security')) {
    return 'Nur der Autor des Berichts kann ihn bearbeiten oder löschen.'
  }

  return `Bericht konnte nicht gespeichert werden. (${message || code || 'Unbekannter Fehler'})`
}

export function mapBerichtStorageError(message: string): string {
  if (message.toLowerCase().includes('bucket') || message.toLowerCase().includes('not found')) {
    return (
      'Der Storage-Bucket für Berichtbilder fehlt. Führe die Milestone-11-Migration aus ' +
      '(supabase/migrations/20260522140000_milestone11_spieltagsberichte.sql).'
    )
  }

  return message || 'Bild konnte nicht hochgeladen werden.'
}
