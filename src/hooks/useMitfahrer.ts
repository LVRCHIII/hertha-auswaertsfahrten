import { useCallback, useEffect, useState } from 'react'
import { fetchMitfahrer, joinMitfahrer, leaveMitfahrer } from '../lib/socialApi'
import type { MitfahrerEintrag } from '../types/social'

export function useMitfahrer(fahrtId: string | undefined) {
  const [entries, setEntries] = useState<MitfahrerEintrag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const reload = useCallback(async () => {
    if (!fahrtId) {
      setEntries([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const result = await fetchMitfahrer(fahrtId)

    if (result.error) {
      setError(result.error)
      setEntries([])
    } else {
      setEntries(result.data ?? [])
    }

    setLoading(false)
  }, [fahrtId])

  useEffect(() => {
    void reload()
  }, [reload])

  const toggle = useCallback(
    async (userId: string, isJoined: boolean) => {
      if (!fahrtId) return

      setActionError(null)
      setBusy(true)

      const result = isJoined
        ? await leaveMitfahrer(fahrtId, userId)
        : await joinMitfahrer(fahrtId, userId)

      setBusy(false)

      if (result.error) {
        setActionError(result.error)
        return
      }

      await reload()
    },
    [fahrtId, reload],
  )

  return { entries, loading, error, actionError, busy, toggle, reload }
}
