/** Entfernung zwischen zwei Koordinaten (Luftlinie). */
export function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng

  return Math.round(2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(h))))
}

export type ParkingCostKind = 'free' | 'paid' | 'mixed' | 'unknown'

export function parkingCostFromOptions(
  options: google.maps.places.ParkingOptions | null | undefined,
): ParkingCostKind {
  if (!options) return 'unknown'

  const free =
    options.hasFreeGarageParking === true ||
    options.hasFreeParkingLot === true ||
    options.hasFreeStreetParking === true

  const paid =
    options.hasPaidGarageParking === true ||
    options.hasPaidParkingLot === true ||
    options.hasPaidStreetParking === true ||
    options.hasValetParking === true

  if (free && paid) return 'mixed'
  if (free) return 'free'
  if (paid) return 'paid'
  return 'unknown'
}

export function parkingCostLabel(kind: ParkingCostKind): string {
  switch (kind) {
    case 'free':
      return 'Kostenlos'
    case 'paid':
      return 'Kostenpflichtig'
    case 'mixed':
      return 'Kostenlos & kostenpflichtig'
    default:
      return 'Kosten unbekannt'
  }
}

export function parkingCostBadgeClass(kind: ParkingCostKind): string {
  switch (kind) {
    case 'free':
      return 'bg-emerald-100 text-emerald-800'
    case 'paid':
      return 'bg-amber-100 text-amber-900'
    case 'mixed':
      return 'bg-slate-200 text-slate-700'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}
