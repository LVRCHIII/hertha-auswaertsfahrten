import { useCallback, useEffect, useState } from 'react'
import { fetchFotoArchiv, type FotoArchivFahrt } from '../lib/fotoArchivApi'

export function useFotoArchiv() {
  const [fahrten, setFahrten] = useState<FotoArchivFahrt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await fetchFotoArchiv()
    setFahrten(result.fahrten)
    setError(result.error)
    setLoading(false)
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { fahrten, loading, error, reload }
}
