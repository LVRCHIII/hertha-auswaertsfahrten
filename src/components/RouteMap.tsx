import { useEffect, useRef } from 'react'
import { loadMapsLibrary, loadRoutesLibrary } from '../lib/googleMapsLoader'

type RouteMapProps = {
  directions: google.maps.DirectionsResult
  className?: string
}

export function RouteMap({ directions, className = '' }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false

    Promise.all([loadMapsLibrary(), loadRoutesLibrary()])
      .then(([mapsLib, routesLib]) => {
        if (cancelled) return

        const map = new mapsLib.Map(container, {
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: 'cooperative',
        })

        rendererRef.current = new routesLib.DirectionsRenderer({
          map,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#003264',
            strokeWeight: 5,
          },
        })
        rendererRef.current.setDirections(directions)
      })
      .catch(() => {
        // Karte optional – Fehler werden in useRoutePlan behandelt
      })

    return () => {
      cancelled = true
      rendererRef.current?.setMap(null)
      rendererRef.current = null
    }
  }, [])

  useEffect(() => {
    rendererRef.current?.setDirections(directions)
  }, [directions])

  return (
    <div
      ref={containerRef}
      className={`h-56 w-full overflow-hidden rounded-xl border border-slate-200 sm:h-72 ${className}`}
      aria-label="Routenkarte"
    />
  )
}
