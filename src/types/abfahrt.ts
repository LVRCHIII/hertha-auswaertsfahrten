export type AbfahrtAbstimmung = {
  fahrt_id: string
  user_id: string
  abfahrt_at: string
  created_at: string
}

export type AbfahrtSlotSummary = {
  abfahrtAt: Date
  count: number
}

export type WinningAbfahrt = {
  time: Date
  count: number
  totalVotes: number
}
