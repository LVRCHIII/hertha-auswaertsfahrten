import type { BerichtBild } from './berichtBilderApi'
import { requireSupabase } from './supabase'
import type { Fahrt } from '../types/fahrt'

export type FotoArchivFahrt = Pick<Fahrt, 'id' | 'gegner' | 'stadion' | 'spiel_at'> & {
  fotos: BerichtBild[]
}

type ArchivFahrtRow = Pick<Fahrt, 'id' | 'gegner' | 'stadion' | 'spiel_at'>

export async function fetchFotoArchiv(): Promise<{
  fahrten: FotoArchivFahrt[]
  error: string | null
}> {
  const client = requireSupabase()
  const [fahrtenResult, bilderResult] = await Promise.all([
    client
      .from('fahrten')
      .select('id, gegner, stadion, spiel_at')
      .order('spiel_at', { ascending: false }),
    client
      .from('bericht_bilder')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: true }),
  ])

  if (fahrtenResult.error) {
    console.error('Fahrten für Fotoarchiv laden fehlgeschlagen:', fahrtenResult.error)
    return { fahrten: [], error: 'Die Fahrten für die Rückblicke konnten nicht geladen werden.' }
  }

  if (bilderResult.error) {
    console.error('Fotos für Fotoarchiv laden fehlgeschlagen:', bilderResult.error)
    return { fahrten: [], error: 'Die Fotos konnten nicht geladen werden.' }
  }

  const bilderByFahrt = new Map<string, BerichtBild[]>()
  for (const bild of (bilderResult.data as BerichtBild[] | null) ?? []) {
    const bilder = bilderByFahrt.get(bild.fahrt_id) ?? []
    bilder.push(bild)
    bilderByFahrt.set(bild.fahrt_id, bilder)
  }

  const fahrten = ((fahrtenResult.data as ArchivFahrtRow[] | null) ?? [])
    .map((fahrt) => ({ ...fahrt, fotos: bilderByFahrt.get(fahrt.id) ?? [] }))
    .filter((fahrt) => fahrt.fotos.length > 0)

  return { fahrten, error: null }
}
