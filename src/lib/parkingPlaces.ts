import { isRefererOrAuthError, refererRestrictionHint } from './googleMapsErrors'
import { loadMapsCore, loadPlacesLibrary, getGoogleMapsApiKey } from './googleMapsLoader'
import { haversineMeters, parkingCostFromOptions } from './parkingInfo'
import type { ParkingSuggestion } from '../types/parking'

const SEARCH_RADIUS_M = 2500
const MAX_RESULTS = 8

const NEARBY_FIELDS = ['displayName', 'formattedAddress', 'location', 'id', 'parkingOptions'] as const

function geocodeStadium(stadium: string): Promise<google.maps.LatLngLiteral> {
  return loadMapsCore().then(
    () =>
      new Promise((resolve, reject) => {
        const geocoder = new google.maps.Geocoder()
        geocoder.geocode({ address: stadium.trim(), region: 'DE' }, (results, status) => {
          if (status !== 'OK' || !results?.[0]?.geometry?.location) {
            reject(new Error('Stadion-Adresse konnte nicht gefunden werden.'))
            return
          }
          const location = results[0].geometry.location
          resolve({ lat: location.lat(), lng: location.lng() })
        })
      }),
  )
}

function latLngFromLocation(
  location: google.maps.LatLng | google.maps.LatLngLiteral | google.maps.LatLngAltitude,
): { lat: number; lng: number } {
  if (location instanceof google.maps.LatLng) {
    return { lat: location.lat(), lng: location.lng() }
  }
  return { lat: location.lat, lng: location.lng }
}

function mapNewPlace(
  place: google.maps.places.Place,
  stadiumCenter: google.maps.LatLngLiteral,
): ParkingSuggestion | null {
  const name = place.displayName?.trim()
  const address = place.formattedAddress?.trim()
  const location = place.location

  if (!name || !address || !location) return null

  const { lat, lng } = latLngFromLocation(location)

  return {
    name,
    address,
    placeId: place.id?.trim() || null,
    lat,
    lng,
    distanceMeters: haversineMeters(stadiumCenter, { lat, lng }),
    costKind: parkingCostFromOptions(place.parkingOptions),
  }
}

function placesApiErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err)
  const lower = message.toLowerCase()

  if (isRefererOrAuthError(message)) {
    return refererRestrictionHint()
  }

  if (lower.includes('permission') || lower.includes('not enabled')) {
    return (
      'Google Places API (New) hat die Anfrage abgelehnt. Aktiviere „Places API (New)“ im Google-Cloud-Projekt ' +
      'und prüfe, ob der API-Key für diese APIs freigegeben ist.'
    )
  }

  if (lower.includes('invalid') && lower.includes('type')) {
    return 'Parkplatz-Suche: ungültiger Ortstyp. Bitte später erneut versuchen.'
  }

  return message || 'Parkplätze in der Nähe konnten nicht geladen werden.'
}

async function nearbyParkingSearch(
  center: google.maps.LatLngLiteral,
): Promise<google.maps.places.Place[]> {
  const { Place, SearchNearbyRankPreference } = await loadPlacesLibrary()

  const { places } = await Place.searchNearby({
    fields: [...NEARBY_FIELDS],
    locationRestriction: {
      center,
      radius: SEARCH_RADIUS_M,
    },
    includedPrimaryTypes: ['parking'],
    maxResultCount: MAX_RESULTS,
    rankPreference: SearchNearbyRankPreference.DISTANCE,
    language: 'de',
    region: 'de',
  })

  return places ?? []
}

export async function searchParkingNearStadium(
  stadium: string,
): Promise<{ data: ParkingSuggestion[]; error: string | null }> {
  if (!stadium.trim()) {
    return { data: [], error: 'Kein Stadion angegeben.' }
  }

  if (!getGoogleMapsApiKey()) {
    return { data: [], error: 'Google Maps API-Key fehlt in der .env-Datei.' }
  }

  try {
    const center = await geocodeStadium(stadium)
    const results = await nearbyParkingSearch(center)

    const seen = new Set<string>()
    const suggestions: ParkingSuggestion[] = []

    for (const place of results) {
      const mapped = mapNewPlace(place, center)
      if (!mapped) continue

      const key = mapped.placeId ?? `${mapped.name}|${mapped.address}`
      if (seen.has(key)) continue
      seen.add(key)
      suggestions.push(mapped)

      if (suggestions.length >= MAX_RESULTS) break
    }

    suggestions.sort((a, b) => a.distanceMeters - b.distanceMeters)

    return { data: suggestions, error: null }
  } catch (err) {
    return { data: [], error: placesApiErrorMessage(err) }
  }
}
