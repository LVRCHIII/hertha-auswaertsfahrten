import { useCallback, useEffect, useState } from 'react'
import { insertFahrt } from '../lib/fahrtenApi'
import { supabase } from '../lib/supabase'
import type { Fahrt, FahrtInsert } from '../types/fahrt'

export function useFahrten() {
  const [fahrten, setFahrten] = useState<Fahrt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFahrten = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('fahrten')
      .select('*')
      .order('spiel_at', { ascending: true })

    if (fetchError) {
      setError('Fahrten konnten nicht geladen werden.')
      setFahrten([])
    } else {
      setFahrten((data as Fahrt[]) ?? [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    void fetchFahrten()
  }, [fetchFahrten])

  const createFahrt = useCallback(
    async (payload: FahrtInsert) => {
      const result = await insertFahrt(payload)
      if (!result.error) {
        await fetchFahrten()
      }
      return result
    },
    [fetchFahrten],
  )

  return { fahrten, loading, error, refetch: fetchFahrten, createFahrt }
}
