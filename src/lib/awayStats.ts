import type { Fahrt } from '../types/fahrt'
import type { MitfahrerEintrag } from '../types/social'

export type AwayStatsTrip = {
  fahrtId: string
  gegner: string
  distanceMeters: number
}

export type AwayStatsRankingEntry = {
  userId: string
  name: string
  rideCount: number
  distanceMeters: number
  missingDistanceCount: number
  longestTrip: AwayStatsTrip | null
}

export type AwayStats = {
  personal: AwayStatsRankingEntry | null
  ranking: AwayStatsRankingEntry[]
  group: {
    participantCount: number
    rideCount: number
    distanceMeters: number
    missingDistanceCount: number
    longestTrip: AwayStatsTrip | null
  }
}

function displayName(entry: MitfahrerEintrag): string {
  return entry.profile?.display_name?.trim() || 'Unbekannt'
}

function distanceFor(fahrt: Fahrt): number | null {
  const distance = fahrt.route_distance_meters
  return typeof distance === 'number' && Number.isFinite(distance) && distance > 0 ? distance : null
}

function betterLongestTrip(current: AwayStatsTrip | null, next: AwayStatsTrip): AwayStatsTrip {
  if (!current) return next
  if (next.distanceMeters > current.distanceMeters) return next
  if (next.distanceMeters === current.distanceMeters && next.gegner.localeCompare(current.gegner, 'de') < 0) {
    return next
  }
  return current
}

function sortRanking(a: AwayStatsRankingEntry, b: AwayStatsRankingEntry): number {
  if (b.rideCount !== a.rideCount) return b.rideCount - a.rideCount
  if (b.distanceMeters !== a.distanceMeters) return b.distanceMeters - a.distanceMeters
  return a.name.localeCompare(b.name, 'de')
}

export function buildAwayStats(
  fahrten: Fahrt[],
  mitfahrerByFahrt: Map<string, MitfahrerEintrag[]>,
  currentUserId?: string | null,
): AwayStats {
  const byUser = new Map<string, AwayStatsRankingEntry>()
  const group = {
    participantCount: 0,
    rideCount: 0,
    distanceMeters: 0,
    missingDistanceCount: 0,
    longestTrip: null as AwayStatsTrip | null,
  }

  for (const fahrt of fahrten) {
    const mitfahrer = mitfahrerByFahrt.get(fahrt.id) ?? []
    const distanceMeters = distanceFor(fahrt)

    for (const entry of mitfahrer) {
      const stats =
        byUser.get(entry.user_id) ??
        ({
          userId: entry.user_id,
          name: displayName(entry),
          rideCount: 0,
          distanceMeters: 0,
          missingDistanceCount: 0,
          longestTrip: null,
        } satisfies AwayStatsRankingEntry)

      stats.name = displayName(entry)
      stats.rideCount += 1
      group.rideCount += 1

      if (distanceMeters == null) {
        stats.missingDistanceCount += 1
        group.missingDistanceCount += 1
      } else {
        const trip = { fahrtId: fahrt.id, gegner: fahrt.gegner, distanceMeters }
        stats.distanceMeters += distanceMeters
        stats.longestTrip = betterLongestTrip(stats.longestTrip, trip)
        group.distanceMeters += distanceMeters
        group.longestTrip = betterLongestTrip(group.longestTrip, trip)
      }

      byUser.set(entry.user_id, stats)
    }
  }

  const ranking = [...byUser.values()].sort(sortRanking)
  group.participantCount = ranking.length

  return {
    personal: currentUserId ? byUser.get(currentUserId) ?? null : null,
    ranking,
    group,
  }
}

export function formatStatsKilometers(meters: number): string {
  if (meters <= 0) return '0 km'

  const kilometers = meters / 1000
  if (kilometers < 10) {
    return `${kilometers.toFixed(1).replace('.', ',')} km`
  }

  return `${Math.round(kilometers).toLocaleString('de-DE')} km`
}
