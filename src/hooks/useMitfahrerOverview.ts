import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchMitfahrerForFahrten } from '../lib/socialApi'
import type { MitfahrerEintrag } from '../types/social'

export function useMitfahrerOverview(fahrtIds: string[]) {
  const [byFahrt, setByFahrt] = useState<Map<string, MitfahrerEintrag[]>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const idsKey = useMemo(() => [...fahrtIds].sort().join(','), [fahrtIds])

  const load = useCallback(async () => {
    if (fahrtIds.length === 0) {
      setByFahrt(new Map())
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const result = await fetchMitfahrerForFahrten(fahrtIds)

    if (result.error) {
      setError(result.error)
      setByFahrt(new Map())
    } else {
      setByFahrt(result.data ?? new Map())
    }

    setLoading(false)
  }, [idsKey, fahrtIds])

  useEffect(() => {
    void load()
  }, [load])

  return { byFahrt, loading, error, reload: load }
}
