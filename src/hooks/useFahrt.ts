import { useCallback, useEffect, useState } from 'react'
import { mapFahrtError } from '../lib/mapSupabaseError'
import { requireSupabase } from '../lib/supabase'
import type { Fahrt } from '../types/fahrt'

export function useFahrt(id: string | undefined) {
  const [fahrt, setFahrt] = useState<Fahrt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFahrt = useCallback(async () => {
    if (!id) {
      setError('Fahrt nicht gefunden.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await requireSupabase()
      .from('fahrten')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) {
      setError(mapFahrtError(fetchError))
      setFahrt(null)
    } else if (!data) {
      setError('Fahrt nicht gefunden.')
      setFahrt(null)
    } else {
      setFahrt(data as Fahrt)
    }

    setLoading(false)
  }, [id])

  useEffect(() => {
    void fetchFahrt()
  }, [fetchFahrt])

  return { fahrt, loading, error, refetch: fetchFahrt }
}
