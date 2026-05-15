export function calculateAnkunftszeit(spielAt: string, pufferMinuten: number): Date {
  const anpfiff = new Date(spielAt).getTime()
  return new Date(anpfiff - pufferMinuten * 60 * 1000)
}

export function calculateAbfahrtszeit(
  spielAt: string,
  fahrtdauerSekunden: number,
  pufferMinuten: number,
): Date {
  const anpfiff = new Date(spielAt).getTime()
  const fahrtMs = fahrtdauerSekunden * 1000
  const pufferMs = pufferMinuten * 60 * 1000
  return new Date(anpfiff - fahrtMs - pufferMs)
}

/** Abfahrt Zuhause, damit man rechtzeitig am Treffpunkt ist. */
export function calculateHomeAbfahrtszeit(
  treffpunktAbfahrt: Date,
  fahrtdauerSekunden: number,
): Date {
  return new Date(treffpunktAbfahrt.getTime() - fahrtdauerSekunden * 1000)
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)
  if (hours === 0) return `${minutes} Min.`
  if (minutes === 0) return `${hours} Std.`
  return `${hours} Std. ${minutes} Min.`
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1).replace('.', ',')} km`
  }
  return `${meters} m`
}

export type RouteLocation = string | { lat: number; lng: number }

function formatLocationParam(location: RouteLocation): string {
  if (typeof location === 'string') return location
  return `${location.lat},${location.lng}`
}

export function buildGoogleMapsDirectionsUrl(
  origin: RouteLocation,
  destination: RouteLocation | string,
): string {
  const params = new URLSearchParams({
    api: '1',
    origin: formatLocationParam(origin),
    destination: formatLocationParam(destination),
    travelmode: 'driving',
  })
  return `https://www.google.com/maps/dir/?${params.toString()}`
}
