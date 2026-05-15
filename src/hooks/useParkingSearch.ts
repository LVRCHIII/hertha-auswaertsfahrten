import { useCallback, useState } from 'react'
import { searchParkingNearStadium } from '../lib/parkingPlaces'
import type { ParkingSuggestion } from '../types/parking'

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; suggestions: ParkingSuggestion[] }
  | { status: 'error'; message: string }

export function useParkingSearch(stadium: string) {
  const [state, setState] = useState<SearchState>({ status: 'idle' })

  const search = useCallback(async () => {
    if (!stadium.trim()) {
      setState({ status: 'error', message: 'Kein Stadion angegeben.' })
      return
    }

    setState({ status: 'loading' })

    const result = await searchParkingNearStadium(stadium)

    if (result.error) {
      setState({ status: 'error', message: result.error })
      return
    }

    if (result.data.length === 0) {
      setState({
        status: 'error',
        message: 'Keine Parkplätze in der Nähe gefunden. Versuche eine manuelle Eingabe.',
      })
      return
    }

    setState({ status: 'ready', suggestions: result.data })
  }, [stadium])

  const reset = useCallback(() => {
    setState({ status: 'idle' })
  }, [])

  return { state, search, reset }
}
