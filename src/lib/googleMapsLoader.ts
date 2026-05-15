import { Loader } from '@googlemaps/js-api-loader'

let loaderInstance: Loader | null = null
let routesPromise: Promise<google.maps.RoutesLibrary> | null = null
let placesPromise: Promise<google.maps.PlacesLibrary> | null = null
let corePromise: Promise<google.maps.CoreLibrary> | null = null

export function getGoogleMapsApiKey(): string | null {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()
  return key && key !== 'dein-google-maps-api-key' ? key : null
}

function getLoader(): Loader {
  const apiKey = getGoogleMapsApiKey()
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_KEY_MISSING')
  }

  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['routes', 'places'],
      region: 'DE',
      language: 'de',
    })
  }

  return loaderInstance
}

export function loadRoutesLibrary(): Promise<google.maps.RoutesLibrary> {
  if (!getGoogleMapsApiKey()) {
    return Promise.reject(new Error('GOOGLE_MAPS_KEY_MISSING'))
  }

  if (!routesPromise) {
    routesPromise = getLoader().importLibrary('routes')
  }

  return routesPromise
}

export function loadPlacesLibrary(): Promise<google.maps.PlacesLibrary> {
  if (!getGoogleMapsApiKey()) {
    return Promise.reject(new Error('GOOGLE_MAPS_KEY_MISSING'))
  }

  if (!placesPromise) {
    placesPromise = getLoader().importLibrary('places')
  }

  return placesPromise
}

/** Geocoder liegt in der Core-Library (nicht in routes/places). */
export function loadMapsCore(): Promise<google.maps.CoreLibrary> {
  if (!getGoogleMapsApiKey()) {
    return Promise.reject(new Error('GOOGLE_MAPS_KEY_MISSING'))
  }

  if (!corePromise) {
    corePromise = getLoader().importLibrary('core')
  }

  return corePromise
}
