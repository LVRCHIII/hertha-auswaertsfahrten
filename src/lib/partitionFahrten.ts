import { isUpcoming } from './fahrtFormat'
import type { Fahrt } from '../types/fahrt'

export function partitionFahrten(fahrten: Fahrt[]) {
  const upcoming = fahrten
    .filter((f) => isUpcoming(f.spiel_at))
    .sort((a, b) => new Date(a.spiel_at).getTime() - new Date(b.spiel_at).getTime())

  const past = fahrten
    .filter((f) => !isUpcoming(f.spiel_at))
    .sort((a, b) => new Date(b.spiel_at).getTime() - new Date(a.spiel_at).getTime())

  return { upcoming, past }
}
