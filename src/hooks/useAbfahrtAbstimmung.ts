import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchAbfahrtAbstimmungen, removeAbfahrtVote, setAbfahrtVote } from '../lib/abfahrtApi'
import { pickWinningAbfahrt, slotsMatch } from '../lib/abfahrtAbstimmung'
import type { AbfahrtAbstimmung, WinningAbfahrt } from '../types/abfahrt'

export function useAbfahrtAbstimmung(fahrtId: string | undefined, currentUserId: string | undefined) {
  const [votes, setVotes] = useState<AbfahrtAbstimmung[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!fahrtId) {
      setVotes([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const result = await fetchAbfahrtAbstimmungen(fahrtId)

    if (result.error) {
      setError(result.error)
      setVotes([])
    } else {
      setVotes(result.data ?? [])
    }

    setLoading(false)
  }, [fahrtId])

  useEffect(() => {
    void load()
  }, [load])

  const winning = useMemo<WinningAbfahrt | null>(() => pickWinningAbfahrt(votes), [votes])

  const myVote = useMemo(() => {
    if (!currentUserId) return null
    return votes.find((vote) => vote.user_id === currentUserId) ?? null
  }, [votes, currentUserId])

  const vote = useCallback(
    async (slot: Date) => {
      if (!fahrtId || !currentUserId) return

      setActionError(null)
      setBusy(true)

      const togglingOff =
        myVote !== null && slotsMatch(new Date(myVote.abfahrt_at), slot)

      const result = togglingOff
        ? await removeAbfahrtVote(fahrtId, currentUserId)
        : await setAbfahrtVote(fahrtId, currentUserId, slot)

      setBusy(false)

      if (result.error) {
        setActionError(result.error)
        return
      }

      await load()
    },
    [fahrtId, currentUserId, myVote, load],
  )

  return {
    votes,
    winning,
    myVote,
    myVoteAt: myVote ? new Date(myVote.abfahrt_at) : null,
    loading,
    error,
    actionError,
    busy,
    vote,
    reload: load,
    hasMyVoteForSlot: (slot: Date) =>
      myVote ? slotsMatch(new Date(myVote.abfahrt_at), slot) : false,
  }
}
