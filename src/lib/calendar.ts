import type { Fahrt } from '../types/fahrt'

export type CalendarDay = {
  date: Date
  key: string
  dayOfMonth: number
  inCurrentMonth: boolean
  isToday: boolean
}

const monthFormatter = new Intl.DateTimeFormat('de-DE', {
  month: 'long',
  year: 'numeric',
})

export const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function mondayBasedWeekday(date: Date): number {
  return (date.getDay() + 6) % 7
}

export function dateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function monthLabel(date: Date): string {
  return monthFormatter.format(date)
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

export function buildCalendarMonth(month: Date): CalendarDay[] {
  const monthStart = startOfMonth(month)
  const gridStart = addDays(monthStart, -mondayBasedWeekday(monthStart))
  const todayKey = dateKey(new Date())

  return Array.from({ length: 42 }, (_, index) => {
    const date = startOfDay(addDays(gridStart, index))
    const key = dateKey(date)

    return {
      date,
      key,
      dayOfMonth: date.getDate(),
      inCurrentMonth: date.getMonth() === monthStart.getMonth(),
      isToday: key === todayKey,
    }
  })
}

export function groupFahrtenByDay(fahrten: Fahrt[]): Map<string, Fahrt[]> {
  const byDay = new Map<string, Fahrt[]>()

  for (const fahrt of fahrten) {
    const key = dateKey(new Date(fahrt.spiel_at))
    const dayFahrten = byDay.get(key) ?? []
    dayFahrten.push(fahrt)
    byDay.set(key, dayFahrten)
  }

  for (const dayFahrten of byDay.values()) {
    dayFahrten.sort((a, b) => new Date(a.spiel_at).getTime() - new Date(b.spiel_at).getTime())
  }

  return byDay
}

export function fahrtenInMonth(fahrten: Fahrt[], month: Date): Fahrt[] {
  const monthStart = startOfMonth(month)

  return fahrten
    .filter((fahrt) => {
      const spielAt = new Date(fahrt.spiel_at)
      return (
        spielAt.getFullYear() === monthStart.getFullYear() &&
        spielAt.getMonth() === monthStart.getMonth()
      )
    })
    .sort((a, b) => new Date(a.spiel_at).getTime() - new Date(b.spiel_at).getTime())
}
