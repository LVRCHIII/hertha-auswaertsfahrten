import type { Fahrt } from '../types/fahrt'

export type SpieltagTimelineItem = {
  id: string
  label: string
  time: Date
  detail?: string
  tone?: 'primary' | 'muted'
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function differenceInCalendarDays(date: Date, baseDate: Date): number {
  const day = startOfLocalDay(date).getTime()
  const baseDay = startOfLocalDay(baseDate).getTime()
  return Math.round((day - baseDay) / (24 * 60 * 60 * 1000))
}

export function pickNextSpieltagFahrt(fahrten: Fahrt[], now = new Date()): Fahrt | null {
  const todayStart = startOfLocalDay(now).getTime()

  return (
    [...fahrten]
      .filter((fahrt) => fahrt.typ === 'auswaerts' && new Date(fahrt.spiel_at).getTime() >= todayStart)
      .sort((a, b) => new Date(a.spiel_at).getTime() - new Date(b.spiel_at).getTime())[0] ?? null
  )
}

export function formatSpieltagDayLabel(spielAt: string, now = new Date()): string {
  const days = differenceInCalendarDays(new Date(spielAt), now)

  if (days === 0) return 'Heute ist Spieltag'
  if (days === 1) return 'Morgen ist Spieltag'
  if (days > 1) return `In ${days} Tagen ist Spieltag`
  if (days === -1) return 'Gestern war Spieltag'
  return `Vor ${Math.abs(days)} Tagen war Spieltag`
}

export function sortSpieltagTimeline(items: SpieltagTimelineItem[]): SpieltagTimelineItem[] {
  return [...items].sort((a, b) => a.time.getTime() - b.time.getTime())
}

export function nextTimelineItem(
  items: SpieltagTimelineItem[],
  now = new Date(),
): SpieltagTimelineItem | null {
  return sortSpieltagTimeline(items).find((item) => item.time.getTime() >= now.getTime()) ?? null
}
