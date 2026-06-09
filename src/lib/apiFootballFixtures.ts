const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY as string | undefined
const BASE_URL = 'https://v3.football.api-sports.io'

export type ApiFixture = {
  fixture: {
    id: number
    date: string
    venue: { name: string | null; city: string | null }
    status: { short: string }
  }
  league: { id: number; name: string; season: number }
  teams: {
    home: { id: number; name: string; logo: string }
    away: { id: number; name: string; logo: string }
  }
}

export type ImportableSpiel = {
  gegner: string
  stadion: string
  spiel_at: string
  liga: string
  /** Bereits als Fahrt vorhanden */
  exists: boolean
}

const HERTHA_TEAM_ID = 159

/** Leagues we care about: 2. Bundesliga + DFB Pokal */
const RELEVANT_LEAGUE_IDS = new Set([78, 79, 529])
// 78 = Bundesliga, 79 = 2. Bundesliga, 529 = DFB Pokal

async function fetchFixtures(teamId: number, season: number): Promise<ApiFixture[]> {
  if (!API_KEY) throw new Error('VITE_API_FOOTBALL_KEY nicht gesetzt')

  const url = `${BASE_URL}/fixtures?team=${teamId}&season=${season}`
  const res = await fetch(url, {
    headers: { 'x-apisports-key': API_KEY },
  })

  if (!res.ok) throw new Error(`API-Fehler ${res.status}`)

  const data = await res.json()
  if (data.errors && Object.keys(data.errors).length > 0) {
    const msg = Object.values(data.errors as Record<string, string>).join(', ')
    throw new Error(msg)
  }

  return (data.response ?? []) as ApiFixture[]
}

/**
 * Holt alle Auswärtsspiele von Hertha BSC für die angegebene Saison.
 * Gibt nur relevante Wettbewerbe zurück (Bundesliga, 2. BL, DFB Pokal).
 * Markiert Spiele die bereits als Fahrt vorhanden sind.
 */
export async function fetchHerthaAuswaertsSpiele(
  vorhandeneSpielDaten: string[],
  season = 2024,
): Promise<ImportableSpiel[]> {
  const fixtures = await fetchFixtures(HERTHA_TEAM_ID, season)

  const vorhandenSet = new Set(
    vorhandeneSpielDaten.map((d) => d.slice(0, 10)),
  )

  return fixtures
    .filter((f) => {
      const isAway = f.teams.away.id === HERTHA_TEAM_ID
      const isRelevant = RELEVANT_LEAGUE_IDS.has(f.league.id)
      return isAway && isRelevant
    })
    .sort((a, b) => a.fixture.date.localeCompare(b.fixture.date))
    .map((f) => {
      const { venue } = f.fixture
      const stadionParts = [venue.name, venue.city].filter(Boolean)
      const datumTag = f.fixture.date.slice(0, 10)

      return {
        gegner: f.teams.home.name,
        stadion: stadionParts.join(', '),
        spiel_at: f.fixture.date,
        liga: f.league.name,
        exists: vorhandenSet.has(datumTag),
      }
    })
}
