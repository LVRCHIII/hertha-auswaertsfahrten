import { AppShell } from '../components/AppShell'
import { AwayStatsCard } from '../components/AwayStatsCard'
import { BerichtEditor } from '../components/BerichtEditor'
import { BesuchteSpielCard } from '../components/BesuchteSpielCard'
import { CalendarView } from '../components/CalendarView'
import { DashboardSection } from '../components/DashboardSection'
import { FahrtSection } from '../components/FahrtSection'
import { useStaggerReveal } from '../lib/gsapFx'
import type { AwayStats } from '../lib/awayStats'
import type { Fahrt } from '../types/fahrt'
import type { WinningAbfahrt } from '../types/abfahrt'
import type { GroupedSpiel } from '../types/futbology'

/**
 * Dev-only Vorschau der redesignten Komponenten mit Mock-Daten.
 * Nur unter import.meta.env.DEV erreichbar — nie im Production-Build.
 */

const inDays = (d: number, h = 15) => {
  const t = new Date()
  t.setDate(t.getDate() + d)
  t.setHours(h, 30, 0, 0)
  return t.toISOString()
}

const mockFahrten: Fahrt[] = [
  {
    id: 'mock-1',
    gegner: '1. FC Kaiserslautern',
    stadion: 'Fritz-Walter-Stadion',
    spiel_at: inDays(6, 13),
    treffpunkt: 'Olympiastadion P03',
    created_at: new Date().toISOString(),
  } as unknown as Fahrt,
  {
    id: 'mock-2',
    gegner: 'SC Paderborn 07',
    stadion: 'Home-Deluxe-Arena',
    spiel_at: inDays(20, 18),
    treffpunkt: null,
    created_at: new Date().toISOString(),
  } as unknown as Fahrt,
  {
    id: 'mock-3',
    gegner: 'Hannover 96',
    stadion: 'Heinz-von-Heiden-Arena',
    spiel_at: inDays(-12, 13),
    treffpunkt: null,
    created_at: new Date().toISOString(),
  } as unknown as Fahrt,
]

const mockAbfahrt = new Map<string, WinningAbfahrt>([
  ['mock-1', { time: new Date(new Date(mockFahrten[0].spiel_at).getTime() - 6.5 * 3600_000), count: 4, totalVotes: 5 } as WinningAbfahrt],
])

const mockStats: AwayStats = {
  personal: {
    userId: 'u1',
    name: 'Lucas',
    rideCount: 9,
    distanceMeters: 4_812_000,
    missingDistanceCount: 0,
    longestTrip: { fahrtId: 'mock-3', gegner: 'Kaiserslautern', distanceMeters: 1_260_000 },
  },
  ranking: [
    { userId: 'u1', name: 'Lucas', rideCount: 9, distanceMeters: 4_812_000, missingDistanceCount: 0, longestTrip: null },
    { userId: 'u2', name: 'Jonas', rideCount: 7, distanceMeters: 3_905_000, missingDistanceCount: 1, longestTrip: null },
    { userId: 'u3', name: 'Mark', rideCount: 5, distanceMeters: 2_410_000, missingDistanceCount: 0, longestTrip: null },
  ],
  group: {
    participantCount: 5,
    rideCount: 21,
    distanceMeters: 11_127_000,
    missingDistanceCount: 1,
    longestTrip: { fahrtId: 'mock-3', gegner: 'Kaiserslautern', distanceMeters: 1_260_000 },
  },
}

export function DesignPreviewPage() {
  const revealRef = useStaggerReveal<HTMLDivElement>([])
  return (
    <AppShell title="Auswärtsfahrten">
      <div ref={revealRef} className="space-y-8">
        <div data-reveal>
          <AwayStatsCard stats={mockStats} />
        </div>
        <div data-reveal>
          <FahrtSection
            title="Kommende Fahrten"
            fahrten={mockFahrten.slice(0, 2)}
            abfahrtByFahrt={mockAbfahrt}
            heroFirst
          />
        </div>
        <div data-reveal>
          <FahrtSection title="Vergangene Fahrten" fahrten={mockFahrten.slice(2)} />
        </div>
        <div data-reveal>
          <CalendarView fahrten={mockFahrten} abfahrtByFahrt={mockAbfahrt} />
        </div>
        <div data-reveal>
          <BesuchteSpielCard spiel={mockSpiel} />
        </div>
        <div data-reveal>
          <DashboardSection title="Spieltagsbericht">
            <BerichtEditor
              initialContent={{
                type: 'doc',
                content: [
                  { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Auswärtssieg in Lautern' }] },
                  { type: 'paragraph', content: [{ type: 'text', text: 'Was für ein Tag auf dem Betze.' }] },
                ],
              }}
            />
          </DashboardSection>
        </div>
      </div>
    </AppShell>
  )
}

const mockSpiel: GroupedSpiel = {
  datum: '2026-05-30',
  heim_team: 'Hannover 96',
  gast_team: 'Hertha BSC',
  stadion: 'Heinz-von-Heiden-Arena',
  liga: '2. Bundesliga',
  ergebnis: '1:2',
  attendees: [
    { user_id: 'u1', display_name: 'Lucas', avatar_url: null },
    { user_id: 'u2', display_name: 'Jonas', avatar_url: null },
  ],
} as unknown as GroupedSpiel
