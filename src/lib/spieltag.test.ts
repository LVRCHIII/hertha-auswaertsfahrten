import { describe, expect, it } from 'vitest'
import type { Fahrt } from '../types/fahrt'
import {
  formatSpieltagDayLabel,
  nextTimelineItem,
  pickNextSpieltagFahrt,
  sortSpieltagTimeline,
} from './spieltag'

function createFahrt(id: string, spielAt: string): Fahrt {
  return {
    id,
    created_at: '2026-01-01T00:00:00.000Z',
    created_by: 'user-1',
    gegner: 'Gegner',
    stadion: 'Stadion',
    spiel_at: spielAt,
    startpunkt: 'Treffpunkt',
    notizen: null,
    treffpunkt_berlin: null,
    treffpunkt_bestaetigt: false,
  }
}

describe('spieltag', () => {
  it('wählt die nächste Fahrt ab dem aktuellen Kalendertag', () => {
    const now = new Date(2026, 4, 16, 12)
    const yesterday = createFahrt('yesterday', new Date(2026, 4, 15, 18, 30).toISOString())
    const todayMorning = createFahrt('today', new Date(2026, 4, 16, 9, 30).toISOString())
    const tomorrow = createFahrt('tomorrow', new Date(2026, 4, 17, 13, 30).toISOString())

    expect(pickNextSpieltagFahrt([tomorrow, yesterday, todayMorning], now)?.id).toBe('today')
  })

  it('formatiert relative Spieltag-Labels', () => {
    const now = new Date(2026, 4, 16, 12)

    expect(formatSpieltagDayLabel(new Date(2026, 4, 16, 18, 30).toISOString(), now)).toBe(
      'Heute ist Spieltag',
    )
    expect(formatSpieltagDayLabel(new Date(2026, 4, 17, 13, 30).toISOString(), now)).toBe(
      'Morgen ist Spieltag',
    )
    expect(formatSpieltagDayLabel(new Date(2026, 4, 20, 18, 30).toISOString(), now)).toBe(
      'In 4 Tagen ist Spieltag',
    )
  })

  it('sortiert Timeline-Einträge und findet den nächsten Punkt', () => {
    const now = new Date(2026, 4, 16, 12)
    const items = [
      { id: 'anpfiff', label: 'Anpfiff', time: new Date(2026, 4, 16, 18, 30) },
      { id: 'treffpunkt', label: 'Treffpunkt', time: new Date(2026, 4, 16, 13, 30) },
      { id: 'zuhause', label: 'Zuhause los', time: new Date(2026, 4, 16, 11, 45) },
    ]

    expect(sortSpieltagTimeline(items).map((item) => item.id)).toEqual([
      'zuhause',
      'treffpunkt',
      'anpfiff',
    ])
    expect(nextTimelineItem(items, now)?.id).toBe('treffpunkt')
  })
})
