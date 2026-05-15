import { Loader } from '@googlemaps/js-api-loader'

let routesPromise: Promise<google.maps.RoutesLibrary> | null = null

export function getGoogleMapsApiKey(): string | null {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()
  return key && key !== 'dein-google-maps-api-key' ? key : null
}

export function loadRoutesLibrary(): Promise<google.maps.RoutesLibrary> {
  const apiKey = getGoogleMapsApiKey()
  if (!apiKey) {
    return Promise.reject(new Error('GOOGLE_MAPS_KEY_MISSING'))
  }

  if (!routesPromise) {
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['routes'],
      region: 'DE',
      language: 'de',
    })
    routesPromise = loader.importLibrary('routes')
  }

  return routesPromise
}
