import { describe, expect, it } from 'vitest'
import type { Fahrt } from '../types/fahrt'
import { buildCalendarMonth, dateKey, fahrtenInMonth, groupFahrtenByDay } from './calendar'

function createFahrt(overrides: Partial<Fahrt>): Fahrt {
  return {
    id: 'fahrt-1',
    created_at: '2026-01-01T00:00:00.000Z',
    created_by: 'user-1',
    openliga_match_id: null,
    gegner: 'Gegner',
    stadion: 'Stadion',
    spiel_at: '2026-05-16T18:30:00.000Z',
    startpunkt: 'Treffpunkt',
    notizen: null,
    treffpunkt_berlin: null,
    treffpunkt_bestaetigt: false,
    route_distance_meters: null,
    ...overrides,
  }
}

describe('calendar', () => {
  it('erstellt ein 6-Wochen-Monatsraster ab Montag', () => {
    const days = buildCalendarMonth(new Date(2026, 4, 1))

    expect(days).toHaveLength(42)
    expect(days[0]).toMatchObject({
      key: '2026-04-27',
      dayOfMonth: 27,
      inCurrentMonth: false,
    })
    expect(days[4]).toMatchObject({
      key: '2026-05-01',
      dayOfMonth: 1,
      inCurrentMonth: true,
    })
    expect(days[41]?.key).toBe('2026-06-07')
  })

  it('gruppiert und sortiert Fahrten pro Kalendertag', () => {
    const later = createFahrt({ id: 'later', spiel_at: '2026-05-16T18:30:00.000Z' })
    const earlier = createFahrt({ id: 'earlier', spiel_at: '2026-05-16T13:00:00.000Z' })
    const otherDay = createFahrt({ id: 'other', spiel_at: '2026-05-17T13:00:00.000Z' })

    const grouped = groupFahrtenByDay([later, otherDay, earlier])

    expect(grouped.get('2026-05-16')?.map((fahrt) => fahrt.id)).toEqual(['earlier', 'later'])
    expect(grouped.get('2026-05-17')?.map((fahrt) => fahrt.id)).toEqual(['other'])
  })

  it('filtert Fahrten für den gewählten Monat', () => {
    const may = createFahrt({ id: 'may', spiel_at: '2026-05-02T13:00:00.000Z' })
    const june = createFahrt({ id: 'june', spiel_at: '2026-06-01T13:00:00.000Z' })

    expect(dateKey(new Date(2026, 4, 2))).toBe('2026-05-02')
    expect(fahrtenInMonth([june, may], new Date(2026, 4, 1)).map((fahrt) => fahrt.id)).toEqual([
      'may',
    ])
  })
})
