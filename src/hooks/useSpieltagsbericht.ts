import { useCallback, useEffect, useState } from 'react'
import {
  deleteSpieltagsbericht,
  fetchSpieltagsbericht,
  saveSpieltagsbericht,
} from '../lib/berichtApi'
import type { BerichtMeta, Spieltagsbericht } from '../types/bericht'

export function useSpieltagsbericht(fahrtId: string | undefined) {
  const [bericht, setBericht] = useState<Spieltagsbericht | null>(null)
  const [loading, setLoading] = useState(Boolean(fahrtId))
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const reload = useCallback(async () => {
    if (!fahrtId) {
      setBericht(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const result = await fetchSpieltagsbericht(fahrtId)
    setBericht(result.bericht)
    setError(result.error)
    setLoading(false)
  }, [fahrtId])

  useEffect(() => {
    void reload()
  }, [reload])

  async function save(
    authorId: string,
    contentJson: Record<string, unknown>,
    meta?: BerichtMeta,
  ): Promise<boolean> {
    if (!fahrtId) return false

    setActionError(null)
    setBusy(true)

    const result = await saveSpieltagsbericht(
      fahrtId,
      authorId,
      contentJson,
      bericht?.author_id,
      meta,
    )

    setBusy(false)

    if (result.error) {
      setActionError(result.error)
      return false
    }

    setBericht(result.bericht)
    return true
  }

  async function remove(): Promise<boolean> {
    if (!fahrtId) return false

    setActionError(null)
    setBusy(true)

    const result = await deleteSpieltagsbericht(fahrtId)
    setBusy(false)

    if (result.error) {
      setActionError(result.error)
      return false
    }

    setBericht(null)
    return true
  }

  return {
    bericht,
    loading,
    error,
    actionError,
    busy,
    save,
    remove,
    reload,
  }
}
