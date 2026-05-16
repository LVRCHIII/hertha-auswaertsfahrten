import { describe, expect, it } from 'vitest'
import {
  haversineMeters,
  parkingCostBadgeClass,
  parkingCostFromOptions,
  parkingCostLabel,
} from './parkingInfo'

describe('parkingInfo', () => {
  it('berechnet Luftlinienentfernungen in Metern', () => {
    expect(haversineMeters({ lat: 0, lng: 0 }, { lat: 0, lng: 0 })).toBe(0)
    expect(haversineMeters({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBe(111195)
  })

  it('leitet Kostenarten aus Google-Parking-Optionen ab', () => {
    expect(parkingCostFromOptions(null)).toBe('unknown')
    expect(
      parkingCostFromOptions({
        hasFreeParkingLot: true,
      } as google.maps.places.ParkingOptions),
    ).toBe('free')
    expect(
      parkingCostFromOptions({
        hasPaidParkingLot: true,
      } as google.maps.places.ParkingOptions),
    ).toBe('paid')
    expect(
      parkingCostFromOptions({
        hasFreeStreetParking: true,
        hasPaidGarageParking: true,
      } as google.maps.places.ParkingOptions),
    ).toBe('mixed')
  })

  it('liefert UI-Labels und Badge-Klassen für Kostenarten', () => {
    expect(parkingCostLabel('free')).toBe('Kostenlos')
    expect(parkingCostLabel('paid')).toBe('Kostenpflichtig')
    expect(parkingCostLabel('mixed')).toBe('Kostenlos & kostenpflichtig')
    expect(parkingCostLabel('unknown')).toBe('Kosten unbekannt')
    expect(parkingCostBadgeClass('free')).toContain('emerald')
    expect(parkingCostBadgeClass('unknown')).toContain('slate')
  })
})
