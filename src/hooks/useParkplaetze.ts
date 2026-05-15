import { useCallback, useEffect, useState } from 'react'
import {
  addParkplatz,
  addParkplatzFromSuggestion,
  clearParkplatzSelection,
  fetchParkplaetze,
  removeParkplatz,
  selectParkplatz,
} from '../lib/parkingApi'
import type { Parkplatz, ParkingSuggestion } from '../types/parking'

export function useParkplaetze(fahrtId: string | undefined) {
  const [entries, setEntries] = useState<Parkplatz[]>([])
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

    const result = await fetchParkplaetze(fahrtId)

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

  const addManual = useCallback(
    async (userId: string, name: string, address: string) => {
      if (!fahrtId) return false

      setActionError(null)
      setBusy(true)

      const result = await addParkplatz({
        fahrt_id: fahrtId,
        name,
        address,
        source: 'manual',
        created_by: userId,
      })

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

  const addFromSuggestion = useCallback(
    async (userId: string, suggestion: ParkingSuggestion) => {
      if (!fahrtId) return false

      setActionError(null)
      setBusy(true)

      const result = await addParkplatzFromSuggestion(fahrtId, userId, suggestion)

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

  const choose = useCallback(
    async (parkplatzId: string) => {
      if (!fahrtId) return

      setActionError(null)
      setBusy(true)

      const result = await selectParkplatz(fahrtId, parkplatzId)

      setBusy(false)

      if (result.error) {
        setActionError(result.error)
        return
      }

      await reload()
    },
    [fahrtId, reload],
  )

  const clearSelection = useCallback(async () => {
    if (!fahrtId) return

    setActionError(null)
    setBusy(true)

    const result = await clearParkplatzSelection(fahrtId)

    setBusy(false)

    if (result.error) {
      setActionError(result.error)
      return
    }

    await reload()
  }, [fahrtId, reload])

  const remove = useCallback(
    async (id: string) => {
      setActionError(null)
      setBusy(true)

      const result = await removeParkplatz(id)

      setBusy(false)

      if (result.error) {
        setActionError(result.error)
        return
      }

      await reload()
    },
    [reload],
  )

  return {
    entries,
    loading,
    error,
    actionError,
    busy,
    addManual,
    addFromSuggestion,
    choose,
    clearSelection,
    remove,
    reload,
  }
}
