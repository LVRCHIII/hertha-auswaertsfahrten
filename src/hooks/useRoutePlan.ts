import { useEffect, useState } from 'react'
import { isRefererOrAuthError, refererRestrictionHint } from '../lib/googleMapsErrors'
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
      return refererRestrictionHint()
    case 'OVER_QUERY_LIMIT':
      return 'Google Maps Kontingent überschritten. Bitte später erneut versuchen.'
    case 'INVALID_REQUEST':
      return 'Ungültige Routenanfrage. Prüfe die Adressen.'
    default:
      return 'Route konnte nicht berechnet werden. Prüfe Start- und Zieladresse.'
  }
}

function isLocationEmpty(location: RouteLocation): boolean {
  return typeof location === 'string' && !location.trim()
}

function locationKey(location: RouteLocation): string {
  return typeof location === 'string' ? location.trim() : `${location.lat},${location.lng}`
}

export function useRoutePlan(
  origin: RouteLocation,
  destination: RouteLocation,
  departureTime?: Date,
) {
  const [state, setState] = useState<RouteState>({ status: 'idle' })

  useEffect(() => {
    if (isLocationEmpty(origin) || isLocationEmpty(destination)) {
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
    const resolvedDestination =
      typeof destination === 'string'
        ? destination.trim()
        : { lat: destination.lat, lng: destination.lng }

    const timeoutId = window.setTimeout(() => {
      if (cancelled) return
      setState({
        status: 'error',
        message: refererRestrictionHint(),
      })
    }, 12_000)

    const clearRouteTimeout = () => window.clearTimeout(timeoutId)

    loadRoutesLibrary()
      .then((routes) => {
        if (cancelled) return

        const service = new routes.DirectionsService()
        service.route(
          {
            origin: resolvedOrigin,
            destination: resolvedDestination,
            travelMode: routes.TravelMode.DRIVING,
            drivingOptions: {
              departureTime: departureTime ?? new Date(),
              trafficModel: routes.TrafficModel.BEST_GUESS,
            },
          },
          (result, status) => {
            if (cancelled) return
            clearRouteTimeout()

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
        clearRouteTimeout()
        let message = 'Google Maps konnte nicht geladen werden. Prüfe API-Key und Netzwerk.'
        if (err instanceof Error) {
          if (err.message === 'GOOGLE_MAPS_KEY_MISSING') {
            message = 'Google Maps API-Key fehlt in der .env-Datei.'
          } else if (isRefererOrAuthError(err.message)) {
            message = refererRestrictionHint()
          }
        }
        setState({ status: 'error', message })
      })

    return () => {
      cancelled = true
      clearRouteTimeout()
    }
  }, [locationKey(origin), locationKey(destination), departureTime?.getTime()])

  return state
}
