import type { AbfahrtAbstimmung, AbfahrtSlotSummary, WinningAbfahrt } from '../types/abfahrt'

const SLOT_MINUTES = 15
const DEFAULT_SLOT_COUNT = 5

export function roundToAbfahrtSlot(date: Date): Date {
  const rounded = new Date(date)
  const totalMinutes = rounded.getHours() * 60 + rounded.getMinutes()
  const slotMinutes = Math.round(totalMinutes / SLOT_MINUTES) * SLOT_MINUTES
  rounded.setHours(Math.floor(slotMinutes / 60), slotMinutes % 60, 0, 0)
  return rounded
}

/** Zeitslots in 15-Minuten-Schritten um die berechnete Abfahrt. */
export function abfahrtSlotOptions(empfohlen: Date, slotCount = DEFAULT_SLOT_COUNT): Date[] {
  const center = roundToAbfahrtSlot(empfohlen)
  const half = Math.floor(slotCount / 2)
  const stepMs = SLOT_MINUTES * 60 * 1000

  return Array.from({ length: slotCount }, (_, index) => {
    return new Date(center.getTime() + (index - half) * stepMs)
  })
}

export function abfahrtSlotKey(date: Date): string {
  return roundToAbfahrtSlot(date).toISOString()
}

export function slotsMatch(a: Date, b: Date): boolean {
  return abfahrtSlotKey(a) === abfahrtSlotKey(b)
}

export function summarizeAbfahrtSlots(votes: AbfahrtAbstimmung[]): AbfahrtSlotSummary[] {
  const counts = new Map<string, number>()

  for (const vote of votes) {
    const key = abfahrtSlotKey(new Date(vote.abfahrt_at))
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([iso, count]) => ({ abfahrtAt: new Date(iso), count }))
    .sort((a, b) => a.abfahrtAt.getTime() - b.abfahrtAt.getTime())
}

export function pickWinningAbfahrt(votes: AbfahrtAbstimmung[]): WinningAbfahrt | null {
  if (votes.length === 0) return null

  const summaries = summarizeAbfahrtSlots(votes)
  let best = summaries[0]

  for (const entry of summaries.slice(1)) {
    if (entry.count > best.count) {
      best = entry
    } else if (entry.count === best.count && entry.abfahrtAt.getTime() < best.abfahrtAt.getTime()) {
      best = entry
    }
  }

  return {
    time: best.abfahrtAt,
    count: best.count,
    totalVotes: votes.length,
  }
}
