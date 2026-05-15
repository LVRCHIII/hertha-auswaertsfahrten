import { HERTHA_TREFFPUNKT, isDefaultTreffpunkt } from './defaultTreffpunkt'
import { qualifyBerlinAddress } from './routeAddresses'
import type { Fahrt } from '../types/fahrt'

export function getTreffpunktLabel(fahrt: Pick<Fahrt, 'treffpunkt_berlin' | 'startpunkt'>): string {
  const trimmed = fahrt.treffpunkt_berlin?.trim() ?? ''
  if (isDefaultTreffpunkt(trimmed)) return HERTHA_TREFFPUNKT.label
  if (trimmed) return trimmed
  return fahrt.startpunkt.trim() || HERTHA_TREFFPUNKT.label
}

export function getTreffpunktMapsUrl(fahrt: Pick<Fahrt, 'treffpunkt_berlin'>): string {
  if (isDefaultTreffpunkt(fahrt.treffpunkt_berlin)) return HERTHA_TREFFPUNKT.mapsUrl
  const label = fahrt.treffpunkt_berlin?.trim()
  if (!label) return HERTHA_TREFFPUNKT.mapsUrl
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(qualifyBerlinAddress(label))}`
}

/** Abweichender Treffpunkt beim Anlegen gilt direkt als bestätigt. */
export function shouldAutoConfirmTreffpunkt(treffpunktBerlin: string): boolean {
  return !isDefaultTreffpunkt(treffpunktBerlin) && Boolean(treffpunktBerlin.trim())
}
