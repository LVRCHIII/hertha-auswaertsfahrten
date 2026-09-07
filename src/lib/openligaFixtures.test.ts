import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  fetchHerthaAuswaertsSpiele,
  formatOpenLigaSeason,
  getCurrentOpenLigaSeason,
  mapOpenLigaMatches,
  type OpenLigaMatch,
  type VorhandenesSpiel,
} from './openligaFixtures'

function createMatch(overrides: Partial<OpenLigaMatch> = {}): OpenLigaMatch {
  return {
    matchID: 83509,
    matchDateTime: '2026-08-07T20:30:00',
    matchDateTimeUTC: '2026-08-07T18:30:00Z',
    leagueName: '2. Fußball-Bundesliga 2026/2027',
    leagueSeason: 2026,
    leagueShortcut: 'bl2',
    team1: {
      teamId: 129,
      teamName: 'VfL Bochum',
      shortName: 'Bochum',
      teamIconUrl: null,
      teamGroupName: null,
    },
    team2: {
      teamId: 54,
      teamName: 'Hertha BSC',
      shortName: 'Hertha',
      teamIconUrl: null,
      teamGroupName: null,
    },
    location: null,
    ...overrides,
  }
}

function createVorhandenesSpiel(
  overrides: Partial<VorhandenesSpiel> = {},
): VorhandenesSpiel {
  return {
    gegner: 'VfL Bochum',
    spiel_at: '2026-08-07T18:30:00.000Z',
    openliga_match_id: null,
    ...overrides,
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('OpenLigaDB-Mapping', () => {
  it('übernimmt nur Hertha-Auswärtsspiele und bevorzugt die UTC-Anstoßzeit', () => {
    const homeMatch = createMatch({
      matchID: 2,
      team1: createMatch().team2,
      team2: createMatch().team1,
    })

    expect(mapOpenLigaMatches([homeMatch, createMatch()], [])).toEqual([
      {
        openliga_match_id: 83509,
        gegner: 'VfL Bochum',
        stadion: 'Vonovia Ruhrstadion, Bochum',
        spiel_at: '2026-08-07T18:30:00.000Z',
        liga: '2. Bundesliga',
        exists: false,
      },
    ])
  })

  it('formatiert API-Orte, sortiert Wettbewerbe und markiert vorhandene Fahrten', () => {
    const pokal = createMatch({
      matchID: 81849,
      matchDateTimeUTC: '2026-08-22T13:30:00Z',
      leagueName: 'DFB Pokal 2026/2027',
      leagueShortcut: 'dfb',
      team1: {
        teamId: 3078,
        teamName: '1.FC Saarbrücken',
        shortName: 'Saarbrücken',
        teamIconUrl: null,
        teamGroupName: null,
      },
      location: {
        locationID: 1,
        locationStadium: 'Ludwigsparkstadion',
        locationCity: 'Saarbrücken',
      },
    })

    const result = mapOpenLigaMatches(
      [pokal, createMatch(), pokal],
      [
        createVorhandenesSpiel({
          gegner: '1. FC Saarbrücken',
          spiel_at: '2026-08-22T13:30:00.000Z',
        }),
      ],
    )

    expect(result).toHaveLength(2)
    expect(result[1]).toMatchObject({
      gegner: '1.FC Saarbrücken',
      stadion: 'Ludwigsparkstadion, Saarbrücken',
      liga: 'DFB-Pokal',
      exists: true,
    })
  })

  it('findet bei abweichender OpenLiga-Schreibweise das lokale Stadion', () => {
    const pokal = createMatch({
      matchID: 81849,
      matchDateTimeUTC: '2026-08-22T13:30:00Z',
      leagueShortcut: 'dfb',
      team1: {
        teamId: 3078,
        teamName: '1.FC Saarbrücken',
        shortName: 'Saarbrücken',
        teamIconUrl: null,
        teamGroupName: null,
      },
      location: null,
    })

    expect(mapOpenLigaMatches([pokal], [])[0]?.stadion).toBe(
      'Ludwigspark-Stadion, Saarbrücken',
    )
  })

  it('überspringt unvollständige oder ungültig datierte API-Einträge', () => {
    expect(mapOpenLigaMatches([
      createMatch({ matchID: 1, team1: null }),
      createMatch({ matchID: 2, team2: null }),
      createMatch({ matchID: 3, matchDateTimeUTC: null }),
      createMatch({ matchID: 4, matchDateTimeUTC: 'kein-datum' }),
      createMatch({ matchID: 5, matchDateTimeUTC: '2026-08-07T18:30:00' }),
    ], [])).toEqual([])
  })

  it('erkennt verschobene Spiele über die persistierte OpenLigaDB-ID', () => {
    const result = mapOpenLigaMatches(
      [createMatch({ matchDateTimeUTC: '2026-09-18T18:30:00Z' })],
      [
        createVorhandenesSpiel({
          spiel_at: '2026-08-07T18:30:00.000Z',
          openliga_match_id: 83509,
        }),
      ],
    )

    expect(result[0]?.exists).toBe(true)
  })

  it('verwechselt verschiedene Gegner am selben Tag nicht', () => {
    const result = mapOpenLigaMatches(
      [createMatch()],
      [
        createVorhandenesSpiel({
          gegner: 'FC Schalke 04',
          openliga_match_id: null,
        }),
      ],
    )

    expect(result[0]?.exists).toBe(false)
  })
})

describe('OpenLigaDB-Saison', () => {
  it('verwendet von Juli bis Juni das Startjahr der Saison', () => {
    expect(getCurrentOpenLigaSeason(new Date(2026, 5, 30, 12))).toBe(2025)
    expect(getCurrentOpenLigaSeason(new Date(2026, 6, 1, 12))).toBe(2026)
    expect(formatOpenLigaSeason(2026)).toBe('2026/27')
  })
})

describe('OpenLigaDB-Abruf', () => {
  it('lädt Bundesliga, 2. Bundesliga und DFB-Pokal ohne API-Key', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [createMatch()],
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchHerthaAuswaertsSpiele([], 2026)

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://api.openligadb.de/getmatchdata/bl1/2026/Hertha',
      { headers: { Accept: 'application/json' } },
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.openligadb.de/getmatchdata/bl2/2026/Hertha',
      { headers: { Accept: 'application/json' } },
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'https://api.openligadb.de/getmatchdata/dfb/2026/Hertha',
      { headers: { Accept: 'application/json' } },
    )
    expect(result.spiele).toHaveLength(1)
    expect(result.warnings).toEqual([])
  })

  it('meldet HTTP- und Schemafehler verständlich', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))
    await expect(fetchHerthaAuswaertsSpiele([], 2026)).rejects.toThrow(
      'OpenLigaDB konnte den Spielplan nicht laden (503).',
    )

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ matches: [] }),
    }))
    await expect(fetchHerthaAuswaertsSpiele([], 2026)).rejects.toThrow(
      'OpenLigaDB hat ungültige Spieldaten geliefert.',
    )
  })

  it('liefert Teilergebnisse mit Warnung, wenn ein Wettbewerb ausfällt', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('/dfb/')) return { ok: false, status: 503 }
      return { ok: true, json: async () => [createMatch()] }
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchHerthaAuswaertsSpiele([], 2026)

    expect(result.spiele).toHaveLength(1)
    expect(result.warnings).toEqual([
      'Nicht geladen: DFB-Pokal. Der Spielplan kann unvollständig sein.',
    ])
  })

  it('weist strukturell ungültige Match-Einträge zurück', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [null, { matchID: 'falsch' }],
    }))

    await expect(fetchHerthaAuswaertsSpiele([], 2026)).rejects.toThrow(
      'OpenLigaDB hat ungültige Spieldaten geliefert.',
    )
  })
})
