import { describe, expect, it } from 'vitest'
import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsPlaceUrl,
  calculateAbfahrtszeit,
  calculateAnkunftszeit,
  calculateHomeAbfahrtszeit,
  formatDistance,
  formatDuration,
} from './departureCalc'

describe('departureCalc', () => {
  it('berechnet Ankunfts-, Treffpunkt- und Zuhause-Abfahrt relativ zum Anpfiff', () => {
    const spielAt = '2026-05-16T18:30:00.000Z'
    const treffpunktAbfahrt = calculateAbfahrtszeit(spielAt, 2 * 60 * 60, 90)

    expect(calculateAnkunftszeit(spielAt, 90).toISOString()).toBe('2026-05-16T17:00:00.000Z')
    expect(treffpunktAbfahrt.toISOString()).toBe('2026-05-16T15:00:00.000Z')
    expect(calculateHomeAbfahrtszeit(treffpunktAbfahrt, 45 * 60).toISOString()).toBe(
      '2026-05-16T14:15:00.000Z',
    )
  })

  it('formatiert Fahrtdauer und Entfernung deutsch lesbar', () => {
    expect(formatDuration(25 * 60)).toBe('25 Min.')
    expect(formatDuration(2 * 60 * 60)).toBe('2 Std.')
    expect(formatDuration(2 * 60 * 60 + 15 * 60)).toBe('2 Std. 15 Min.')
    expect(formatDistance(850)).toBe('850 m')
    expect(formatDistance(1250)).toBe('1,3 km')
  })

  it('baut Google-Maps-URLs für Adressen, Koordinaten und Place IDs', () => {
    const routeUrl = buildGoogleMapsDirectionsUrl('Berlin Hbf', {
      lat: 52.5145,
      lng: 13.3501,
    })

    expect(routeUrl).toContain('api=1')
    expect(routeUrl).toContain('origin=Berlin+Hbf')
    expect(routeUrl).toContain('destination=52.5145%2C13.3501')
    expect(routeUrl).toContain('travelmode=driving')

    expect(buildGoogleMapsPlaceUrl('Olympiastadion Berlin', 'abc-123')).toContain(
      'query_place_id=abc-123',
    )
    expect(buildGoogleMapsPlaceUrl('Parkplatz', null, 52.5145, 13.3501)).toContain(
      'query=52.5145,13.3501',
    )
  })
})
