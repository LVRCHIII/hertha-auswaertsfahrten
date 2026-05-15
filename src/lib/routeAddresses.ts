import { HERTHA_TREFFPUNKT, isDefaultTreffpunkt } from './defaultTreffpunkt'
import type { Fahrt } from '../types/fahrt'

export type RouteLocation = string | google.maps.LatLngLiteral

/** Erkennt, ob die Adresse schon Stadt oder Land enthält. */
const LOCATION_HINT =
  /,|\b(deutschland|germany|berlin|münchen|muenchen|hamburg|dortmund|köln|koeln|leipzig|bremen|frankfurt|stuttgart|düsseldorf|duesseldorf|bielefeld|mönchengladbach|moenchengladbach|freiburg|augsburg|mainz|kiel|heidenheim|sinsheim|sankt augustin|gelsenkirchen|schwielowsee|kladow)\b/i

function hasLocationHint(address: string): boolean {
  return LOCATION_HINT.test(address)
}

/** Start/Treffpunkt eindeutig in Berlin/Brandenburg verorten. */
export function qualifyBerlinAddress(address: string): string {
  const trimmed = address.trim()
  if (!trimmed) return ''
  if (hasLocationHint(trimmed)) return trimmed
  return `${trimmed}, Berlin, Deutschland`
}

/** Letztes Wort des Gegners als Stadt (z. B. „Arminia Bielefeld“ → Bielefeld). */
function cityFromGegner(gegner: string): string | null {
  const parts = gegner.trim().split(/\s+/).filter(Boolean)
  if (parts.length < 2) return null

  const last = parts[parts.length - 1]
  const notACity = new Set(['BSC', 'SC', 'FC', 'SV', 'VfB', 'VfL', 'TSG', 'SSV', 'FSV', '04'])
  if (notACity.has(last)) return null

  return last
}

/** Stadion/Ziel eindeutig verorten. */
export function qualifyDestinationAddress(stadion: string, gegner: string): string {
  const trimmed = stadion.trim()
  if (!trimmed) return ''
  if (hasLocationHint(trimmed)) return trimmed

  const city = cityFromGegner(gegner)
  if (city) return `${trimmed}, ${city}, Deutschland`

  return `${trimmed}, Deutschland`
}

export type RouteEndpoints = {
  origin: RouteLocation
  destination: string
  originLabel: string
  destinationLabel: string
  /** Vollständige Adresse/Koordinaten für die Berechnung (Anzeige) */
  originResolved: string
}

export function getRouteEndpoints(
  fahrt: Pick<Fahrt, 'treffpunkt_berlin' | 'startpunkt' | 'stadion' | 'gegner'>,
): RouteEndpoints {
  const treffpunkt = fahrt.treffpunkt_berlin?.trim() ?? ''

  if (isDefaultTreffpunkt(treffpunkt)) {
    return {
      origin: { ...HERTHA_TREFFPUNKT.coordinates },
      destination: qualifyDestinationAddress(fahrt.stadion, fahrt.gegner),
      originLabel: HERTHA_TREFFPUNKT.label,
      destinationLabel: fahrt.stadion.trim(),
      originResolved: HERTHA_TREFFPUNKT.address,
    }
  }

  const originLabel = treffpunkt || fahrt.startpunkt.trim() || 'Berlin'
  const origin = qualifyBerlinAddress(originLabel)

  return {
    origin,
    destination: qualifyDestinationAddress(fahrt.stadion, fahrt.gegner),
    originLabel,
    destinationLabel: fahrt.stadion.trim(),
    originResolved: origin,
  }
}

/** Abfahrtszeit für Verkehrsprognose: Spieltag, mindestens jetzt (API-Anforderung). */
export function departureTimeForTraffic(spielAt: string, pufferMinuten: number): Date {
  const spiel = new Date(spielAt).getTime()
  const guessMs = 3.5 * 60 * 60 * 1000 + pufferMinuten * 60 * 1000
  const estimated = new Date(spiel - guessMs)
  const now = new Date()
  return estimated > now ? estimated : now
}

/** Verkehrsprognose für die Fahrt Zuhause → Treffpunkt. */
export function departureTimeForHomeLeg(treffpunktAbfahrt: Date): Date {
  const guess = new Date(treffpunktAbfahrt.getTime() - 2 * 60 * 60 * 1000)
  const now = new Date()
  return guess > now ? guess : now
}
