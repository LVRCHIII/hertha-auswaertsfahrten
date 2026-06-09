import { useCallback, useEffect, useState } from 'react'
import {
  addBerichtBild,
  fetchBerichtBilder,
  removeBerichtBild,
  type BerichtBild,
} from '../lib/berichtBilderApi'

export function useBerichtBilder(fahrtId: string | undefined) {
  const [bilder, setBilder] = useState<BerichtBild[]>([])
  const [loading, setLoading] = useState(Boolean(fahrtId))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!fahrtId) { setLoading(false); return }
    setLoading(true)
    const result = await fetchBerichtBilder(fahrtId)
    setBilder(result.bilder)
    setError(result.error)
    setLoading(false)
  }, [fahrtId])

  useEffect(() => { void reload() }, [reload])

  async function addBild(userId: string, file: File): Promise<boolean> {
    if (!fahrtId) return false
    setBusy(true)
    setError(null)
    const result = await addBerichtBild(fahrtId, userId, file)
    setBusy(false)
    if (result.error) { setError(result.error); return false }
    if (result.bild) setBilder((prev) => [...prev, result.bild!])
    return true
  }

  async function removeBild(bildId: string, path: string): Promise<boolean> {
    setBusy(true)
    setError(null)
    const result = await removeBerichtBild(bildId, path)
    setBusy(false)
    if (result.error) { setError(result.error); return false }
    setBilder((prev) => prev.filter((b) => b.id !== bildId))
    return true
  }

  return { bilder, loading, busy, error, addBild, removeBild, reload }
}
