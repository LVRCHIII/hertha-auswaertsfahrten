import { describe, expect, it } from 'vitest'
import type { Fahrt } from '../types/fahrt'
import type { MitfahrerEintrag } from '../types/social'
import { buildAwayStats, formatStatsKilometers } from './awayStats'

function createFahrt(
  id: string,
  gegner: string,
  routeDistanceMeters: number | null,
): Fahrt {
  return {
    id,
    created_at: '2026-01-01T00:00:00.000Z',
    created_by: 'user-1',
    openliga_match_id: null,
    typ: 'auswaerts',
    gegner,
    stadion: `${gegner} Stadion`,
    spiel_at: '2026-05-16T18:30:00.000Z',
    startpunkt: 'Treffpunkt',
    notizen: null,
    treffpunkt_berlin: null,
    treffpunkt_bestaetigt: false,
    route_distance_meters: routeDistanceMeters,
  }
}

function createMitfahrer(fahrtId: string, userId: string, name: string): MitfahrerEintrag {
  return {
    fahrt_id: fahrtId,
    user_id: userId,
    created_at: '2026-01-01T00:00:00.000Z',
    profile: { display_name: name, avatar_url: null },
  }
}

describe('awayStats', () => {
  it('zählt nur Fahrten, bei denen der User in der Mitfahrer-Liste steht', () => {
    const fahrten = [
      createFahrt('a', 'Nürnberg', 420_000),
      createFahrt('b', 'Hannover', 290_000),
      createFahrt('c', 'Düsseldorf', 560_000),
    ]
    const mitfahrerByFahrt = new Map([
      ['a', [createMitfahrer('a', 'user-1', 'Lucas'), createMitfahrer('a', 'user-2', 'Mia')]],
      ['b', [createMitfahrer('b', 'user-2', 'Mia')]],
      ['c', []],
    ])

    const stats = buildAwayStats(fahrten, mitfahrerByFahrt, 'user-1')

    expect(stats.personal).toMatchObject({
      userId: 'user-1',
      rideCount: 1,
      distanceMeters: 420_000,
    })
    expect(stats.group.rideCount).toBe(3)
    expect(stats.group.distanceMeters).toBe(1_130_000)
  })

  it('sortiert das Ranking nach Fahrten, Kilometern und Name', () => {
    const fahrten = [
      createFahrt('short', 'Magdeburg', 150_000),
      createFahrt('long', 'Karlsruhe', 680_000),
    ]
    const mitfahrerByFahrt = new Map([
      [
        'short',
        [
          createMitfahrer('short', 'user-a', 'Anne'),
          createMitfahrer('short', 'user-b', 'Ben'),
          createMitfahrer('short', 'user-c', 'Clara'),
        ],
      ],
      [
        'long',
        [
          createMitfahrer('long', 'user-a', 'Anne'),
          createMitfahrer('long', 'user-b', 'Ben'),
        ],
      ],
    ])

    const stats = buildAwayStats(fahrten, mitfahrerByFahrt)

    expect(stats.ranking.map((entry) => entry.userId)).toEqual(['user-a', 'user-b', 'user-c'])
    expect(stats.ranking[0]).toMatchObject({
      rideCount: 2,
      distanceMeters: 830_000,
      longestTrip: { gegner: 'Karlsruhe', distanceMeters: 680_000 },
    })
  })

  it('markiert fehlende Distanzen und formatiert Kilometer', () => {
    const stats = buildAwayStats(
      [createFahrt('missing', 'Kiel', null)],
      new Map([['missing', [createMitfahrer('missing', 'user-1', 'Lucas')]]]),
      'user-1',
    )

    expect(stats.personal?.missingDistanceCount).toBe(1)
    expect(stats.personal?.distanceMeters).toBe(0)
    expect(formatStatsKilometers(0)).toBe('0 km')
    expect(formatStatsKilometers(1_250)).toBe('1,3 km')
    expect(formatStatsKilometers(1_250_400)).toBe('1.250 km')
  })
})
