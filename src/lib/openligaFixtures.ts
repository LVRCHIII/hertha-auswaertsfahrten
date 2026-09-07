import { HERTHA_STADION, resolveGegnerStadion } from '../data/vereine'

const OPENLIGA_BASE_URL = 'https://api.openligadb.de'
const HERTHA_TEAM_ID = 54
const TEAM_FILTER = 'Hertha'

const COMPETITIONS = [
  { shortcut: 'bl1', label: 'Bundesliga' },
  { shortcut: 'bl2', label: '2. Bundesliga' },
  { shortcut: 'dfb', label: 'DFB-Pokal' },
] as const

type CompetitionShortcut = (typeof COMPETITIONS)[number]['shortcut']

export type OpenLigaTeam = {
  teamId: number
  teamName: string | null
  shortName: string | null
  teamIconUrl: string | null
  teamGroupName: string | null
}

export type OpenLigaLocation = {
  locationID: number
  locationCity: string | null
  locationStadium: string | null
}

export type OpenLigaMatch = {
  matchID: number
  matchDateTime: string | null
  matchDateTimeUTC: string | null
  leagueName: string | null
  leagueSeason: number
  leagueShortcut: string | null
  team1: OpenLigaTeam | null
  team2: OpenLigaTeam | null
  location: OpenLigaLocation | null
}

export type ImportableSpiel = {
  openliga_match_id: number
  gegner: string
  stadion: string
  spiel_at: string
  liga: string
  /** Bereits als Fahrt vorhanden */
  exists: boolean
}

export type VorhandenesSpiel = {
  gegner: string
  spiel_at: string
  openliga_match_id?: number | null
}

export type OpenLigaImportResult = {
  spiele: ImportableSpiel[]
  warnings: string[]
}

export function getCurrentOpenLigaSeason(now = new Date()): number {
  const year = now.getFullYear()
  return now.getMonth() >= 6 ? year : year - 1
}

export function formatOpenLigaSeason(season: number): string {
  return `${season}/${String((season + 1) % 100).padStart(2, '0')}`
}

function competitionLabel(shortcut: string | null): string {
  return COMPETITIONS.find((competition) => competition.shortcut === shortcut)?.label
    ?? 'Fußball'
}

function isHertha(team: OpenLigaTeam | null): boolean {
  return team?.teamId === HERTHA_TEAM_ID
}

function normalizeUtcDate(value: string | null): string | null {
  if (!value) return null
  if (!/(?:Z|[+-]\d{2}:\d{2})$/i.test(value)) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function normalizeTeamName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function legacySpielKey(gegner: string, spielAt: string): string {
  return `${normalizeTeamName(gegner)}:${spielAt.slice(0, 10)}`
}

function formatLocation(location: OpenLigaLocation | null): string {
  const stadium = location?.locationStadium?.trim() ?? ''
  const city = location?.locationCity?.trim() ?? ''

  if (!stadium) return city
  if (!city || stadium.toLocaleLowerCase('de-DE').includes(city.toLocaleLowerCase('de-DE'))) {
    return stadium
  }

  return `${stadium}, ${city}`
}

export function mapOpenLigaMatches(
  matches: OpenLigaMatch[],
  vorhandeneSpiele: VorhandenesSpiel[],
  heim = false,
): ImportableSpiel[] {
  const vorhandeneMatchIds = new Set(
    vorhandeneSpiele.flatMap((spiel) =>
      typeof spiel.openliga_match_id === 'number' ? [spiel.openliga_match_id] : [],
    ),
  )
  const vorhandeneLegacyKeys = new Set(
    vorhandeneSpiele.map((spiel) => legacySpielKey(spiel.gegner, spiel.spiel_at)),
  )
  const uniqueMatches = new Map<number, OpenLigaMatch>()

  for (const match of matches) {
    uniqueMatches.set(match.matchID, match)
  }

  return [...uniqueMatches.values()]
    .flatMap((match) => {
      const herthaTeam = heim ? match.team1 : match.team2
      const gegnerTeam = heim ? match.team2 : match.team1
      if (!isHertha(herthaTeam) || isHertha(gegnerTeam)) return []

      const gegner = gegnerTeam?.teamName?.trim() ?? ''
      const spielAt = normalizeUtcDate(match.matchDateTimeUTC)
      if (!gegner || !spielAt) return []

      const apiLocation = formatLocation(match.location)
      const stadion = apiLocation || (heim ? HERTHA_STADION : resolveGegnerStadion(gegner) || gegner)

      return [{
        openliga_match_id: match.matchID,
        gegner,
        stadion,
        spiel_at: spielAt,
        liga: competitionLabel(match.leagueShortcut),
        exists:
          vorhandeneMatchIds.has(match.matchID) ||
          vorhandeneLegacyKeys.has(legacySpielKey(gegner, spielAt)),
      }]
    })
    .sort((a, b) => a.spiel_at.localeCompare(b.spiel_at))
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isOpenLigaTeam(value: unknown): value is OpenLigaTeam | null {
  if (value === null) return true
  if (!isRecord(value)) return false

  return (
    Number.isInteger(value.teamId) &&
    isNullableString(value.teamName) &&
    isNullableString(value.shortName) &&
    isNullableString(value.teamIconUrl) &&
    isNullableString(value.teamGroupName)
  )
}

function isOpenLigaLocation(value: unknown): value is OpenLigaLocation | null {
  if (value === null) return true
  if (!isRecord(value)) return false

  return (
    Number.isInteger(value.locationID) &&
    isNullableString(value.locationCity) &&
    isNullableString(value.locationStadium)
  )
}

function isOpenLigaMatch(value: unknown): value is OpenLigaMatch {
  if (!isRecord(value)) return false

  return (
    Number.isInteger(value.matchID) &&
    isNullableString(value.matchDateTime) &&
    isNullableString(value.matchDateTimeUTC) &&
    isNullableString(value.leagueName) &&
    Number.isInteger(value.leagueSeason) &&
    isNullableString(value.leagueShortcut) &&
    isOpenLigaTeam(value.team1) &&
    isOpenLigaTeam(value.team2) &&
    isOpenLigaLocation(value.location)
  )
}

async function fetchCompetitionMatches(
  shortcut: CompetitionShortcut,
  season: number,
): Promise<OpenLigaMatch[]> {
  const url = `${OPENLIGA_BASE_URL}/getmatchdata/${shortcut}/${season}/${TEAM_FILTER}`
  const response = await fetch(url, { headers: { Accept: 'application/json' } })

  if (!response.ok) {
    throw new Error(`OpenLigaDB konnte den Spielplan nicht laden (${response.status}).`)
  }

  const data: unknown = await response.json()
  if (!Array.isArray(data) || !data.every(isOpenLigaMatch)) {
    throw new Error('OpenLigaDB hat ungültige Spieldaten geliefert.')
  }

  return data
}

/**
 * Lädt Herthas Spiele (heim oder auswärts) aus Bundesliga, 2. Bundesliga und DFB-Pokal.
 * OpenLigaDB verwendet als Saisonwert immer das Startjahr, z. B. 2026 für 2026/27.
 */
async function fetchHerthaSpiele(
  vorhandeneSpiele: VorhandenesSpiel[],
  season: number,
  heim: boolean,
): Promise<OpenLigaImportResult> {
  const competitionResults = await Promise.allSettled(
    COMPETITIONS.map(({ shortcut }) => fetchCompetitionMatches(shortcut, season)),
  )

  const competitionMatches: OpenLigaMatch[][] = []
  const failedCompetitions: string[] = []

  competitionResults.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      competitionMatches.push(result.value)
    } else {
      failedCompetitions.push(COMPETITIONS[index].label)
    }
  })

  if (competitionMatches.length === 0) {
    const firstFailure = competitionResults.find(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    )
    if (firstFailure?.reason instanceof Error) throw firstFailure.reason
    throw new Error('OpenLigaDB konnte den Spielplan nicht laden.')
  }

  return {
    spiele: mapOpenLigaMatches(competitionMatches.flat(), vorhandeneSpiele, heim),
    warnings: failedCompetitions.length > 0
      ? [
          `Nicht geladen: ${failedCompetitions.join(', ')}. Der Spielplan kann unvollständig sein.`,
        ]
      : [],
  }
}

export async function fetchHerthaAuswaertsSpiele(
  vorhandeneSpiele: VorhandenesSpiel[],
  season = getCurrentOpenLigaSeason(),
): Promise<OpenLigaImportResult> {
  return fetchHerthaSpiele(vorhandeneSpiele, season, false)
}

export async function fetchHerthaHeimSpiele(
  vorhandeneSpiele: VorhandenesSpiel[],
  season = getCurrentOpenLigaSeason(),
): Promise<OpenLigaImportResult> {
  return fetchHerthaSpiele(vorhandeneSpiele, season, true)
}
