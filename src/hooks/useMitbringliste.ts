import { useCallback, useEffect, useState } from 'react'
import {
  addMitbringItem,
  fetchMitbringliste,
  removeMitbringItem,
} from '../lib/socialApi'
import type { MitbringEintrag } from '../types/social'

export function useMitbringliste(fahrtId: string | undefined) {
  const [entries, setEntries] = useState<MitbringEintrag[]>([])
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

    const result = await fetchMitbringliste(fahrtId)

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

  const addItem = useCallback(
    async (userId: string, item: string) => {
      if (!fahrtId) return

      setActionError(null)
      setBusy(true)

      const result = await addMitbringItem(fahrtId, userId, item)

      setBusy(false)

      if (result.error) {
        setActionError(result.error)
        return false
      }

      await reload()
      return true
    },
    [fahrtId, reload],
  )

  const removeItem = useCallback(async (id: string) => {
    setActionError(null)
    setBusy(true)

    const result = await removeMitbringItem(id)

    setBusy(false)

    if (result.error) {
      setActionError(result.error)
      return
    }

    await reload()
  }, [reload])

  return { entries, loading, error, actionError, busy, addItem, removeItem, reload }
}
