import { useCallback, useEffect, useState } from 'react'
import { fetchAllFutbologySpiele } from '../lib/futbologyApi'
import type { FutbologyAttendee, FutbologySpiel, GroupedSpiel } from '../types/futbology'

function groupSpiele(spiele: FutbologySpiel[]): GroupedSpiel[] {
  const map = new Map<string, GroupedSpiel>()

  for (const spiel of spiele) {
    const key = `${spiel.datum}|${spiel.heim_team}|${spiel.gast_team}`
    const attendee: FutbologyAttendee = {
      user_id: spiel.user_id,
      display_name: spiel.profile?.display_name ?? 'Unbekannt',
      avatar_url: spiel.profile?.avatar_url ?? null,
    }
    const existing = map.get(key)
    if (existing) {
      existing.attendees.push(attendee)
    } else {
      map.set(key, {
        datum: spiel.datum,
        stadion: spiel.stadion,
        heim_team: spiel.heim_team,
        gast_team: spiel.gast_team,
        ergebnis: spiel.ergebnis,
        liga: spiel.liga,
        attendees: [attendee],
      })
    }
  }

  return Array.from(map.values())
}

export function useFutbologySpiele() {
  const [spiele, setSpiele] = useState<GroupedSpiel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await fetchAllFutbologySpiele()
    if (result.error) {
      setError(result.error)
    } else {
      setSpiele(groupSpiele(result.data))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { spiele, loading, error, reload: load }
}
