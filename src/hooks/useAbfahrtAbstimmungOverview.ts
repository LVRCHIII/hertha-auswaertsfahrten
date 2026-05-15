import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchAbfahrtAbstimmungenForFahrten } from '../lib/abfahrtApi'
import { pickWinningAbfahrt } from '../lib/abfahrtAbstimmung'
import type { WinningAbfahrt } from '../types/abfahrt'

export function useAbfahrtAbstimmungOverview(fahrtIds: string[]) {
  const [winningByFahrt, setWinningByFahrt] = useState<Map<string, WinningAbfahrt>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const idsKey = useMemo(() => [...fahrtIds].sort().join(','), [fahrtIds])

  const load = useCallback(async () => {
    if (fahrtIds.length === 0) {
      setWinningByFahrt(new Map())
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const result = await fetchAbfahrtAbstimmungenForFahrten(fahrtIds)

    if (result.error) {
      setError(result.error)
      setWinningByFahrt(new Map())
    } else {
      const next = new Map<string, WinningAbfahrt>()
      for (const [fahrtId, votes] of result.data ?? []) {
        const winning = pickWinningAbfahrt(votes)
        if (winning) next.set(fahrtId, winning)
      }
      setWinningByFahrt(next)
    }

    setLoading(false)
  }, [idsKey, fahrtIds])

  useEffect(() => {
    void load()
  }, [load])

  return { winningByFahrt, loading, error, reload: load }
}
