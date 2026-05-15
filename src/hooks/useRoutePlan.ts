import { useEffect, useState } from 'react'
import { loadRoutesLibrary, getGoogleMapsApiKey } from '../lib/googleMapsLoader'
import type { RouteLocation } from '../lib/routeAddresses'

export type RoutePlan = {
  durationSeconds: number
  distanceMeters: number
}

type RouteState =
  | { status: 'idle' }
  | { status: 'no_key' }
  | { status: 'loading' }
  | { status: 'ready'; plan: RoutePlan }
  | { status: 'error'; message: string }

function directionsErrorMessage(status: string): string {
  switch (status) {
    case 'ZERO_RESULTS':
      return 'Keine Route gefunden. Prüfe Start- und Zieladresse.'
    case 'NOT_FOUND':
      return 'Start oder Ziel konnte nicht gefunden werden.'
    case 'REQUEST_DENIED':
      return 'Google Maps hat die Anfrage abgelehnt. Prüfe API-Key, aktivierte APIs (Maps JavaScript + Directions) und Referrer-Einschränkung.'
    case 'OVER_QUERY_LIMIT':
      return 'Google Maps Kontingent überschritten. Bitte später erneut versuchen.'
    case 'INVALID_REQUEST':
      return 'Ungültige Routenanfrage. Prüfe die Adressen.'
    default:
      return 'Route konnte nicht berechnet werden. Prüfe Start- und Zieladresse.'
  }
}

function isOriginEmpty(origin: RouteLocation): boolean {
  return typeof origin === 'string' && !origin.trim()
}

function originKey(origin: RouteLocation): string {
  return typeof origin === 'string' ? origin.trim() : `${origin.lat},${origin.lng}`
}

export function useRoutePlan(
  origin: RouteLocation,
  destination: string,
  departureTime?: Date,
) {
  const [state, setState] = useState<RouteState>({ status: 'idle' })

  useEffect(() => {
    if (isOriginEmpty(origin) || !destination.trim()) {
      setState({ status: 'idle' })
      return
    }

    if (!getGoogleMapsApiKey()) {
      setState({ status: 'no_key' })
      return
    }

    let cancelled = false
    setState({ status: 'loading' })

    const resolvedOrigin =
      typeof origin === 'string' ? origin.trim() : { lat: origin.lat, lng: origin.lng }

    loadRoutesLibrary()
      .then((routes) => {
        if (cancelled) return

        const service = new routes.DirectionsService()
        service.route(
          {
            origin: resolvedOrigin,
            destination: destination.trim(),
            travelMode: routes.TravelMode.DRIVING,
            drivingOptions: {
              departureTime: departureTime ?? new Date(),
              trafficModel: routes.TrafficModel.BEST_GUESS,
            },
          },
          (result, status) => {
            if (cancelled) return

            if (status !== routes.DirectionsStatus.OK || !result?.routes[0]?.legs[0]) {
              setState({
                status: 'error',
                message: directionsErrorMessage(status),
              })
              return
            }

            const leg = result.routes[0].legs[0]
            const durationSeconds = leg.duration_in_traffic?.value ?? leg.duration?.value
            const distanceMeters = leg.distance?.value

            if (!durationSeconds || !distanceMeters) {
              setState({ status: 'error', message: 'Routendaten unvollständig.' })
              return
            }

            setState({
              status: 'ready',
              plan: { durationSeconds, distanceMeters },
            })
          },
        )
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message =
          err instanceof Error && err.message === 'GOOGLE_MAPS_KEY_MISSING'
            ? 'Google Maps API-Key fehlt in der .env-Datei.'
            : 'Google Maps konnte nicht geladen werden. Prüfe API-Key und Netzwerk.'
        setState({ status: 'error', message })
      })

    return () => {
      cancelled = true
    }
  }, [originKey(origin), destination, departureTime?.getTime()])

  return state
}
