/** Fester Abfahrtsort der Gruppe (Google Maps: maps.app.goo.gl/EciFoKXuZcZfnGLi9) */
export const HERTHA_TREFFPUNKT = {
  label: 'Pendlerparkplatz Schwielowsee (nähe Kladow)',
  departureHeading: 'Empfohlene Abfahrt vom Pendlerparkplatz Schwielowsee',
  address: 'Pendlerparkplatz, 14548 Schwielowsee, Deutschland',
  mapsUrl: 'https://maps.app.goo.gl/EciFoKXuZcZfnGLi9',
  coordinates: { lat: 52.3077042, lng: 12.8736859 },
} as const

const LEGACY_LABELS = ['Pendlerparkplatz Dallgow-Döberitz'] as const

const GENERIC_ALIASES = [
  /^pendlerparkplatz$/i,
  /^pendlerparkplatz[\s,]*(schwielowsee|kladow)?$/i,
  /^pendlerparkplatz[\s,]*(dallgow|dallgow-döberitz|dallgow-doeberitz)?$/i,
  /^pendlerparkplatz[\s,]*berlin$/i,
]

/** Leer oder nur „Pendlerparkplatz“ → Standard-Treffpunkt mit exakten Koordinaten. */
export function isDefaultTreffpunkt(value: string | null | undefined): boolean {
  const trimmed = value?.trim()
  if (!trimmed) return true
  if (trimmed === HERTHA_TREFFPUNKT.label) return true
  if (LEGACY_LABELS.includes(trimmed as (typeof LEGACY_LABELS)[number])) return true
  return GENERIC_ALIASES.some((pattern) => pattern.test(trimmed))
}
