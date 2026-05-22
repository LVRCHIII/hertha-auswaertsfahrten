import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { AwayStatsCard } from '../components/AwayStatsCard'
import { CalendarView } from '../components/CalendarView'
import { FahrtSection } from '../components/FahrtSection'
import { useAuth } from '../contexts/AuthContext'
import { useFahrten } from '../hooks/useFahrten'
import { useAbfahrtAbstimmungOverview } from '../hooks/useAbfahrtAbstimmungOverview'
import { useMitfahrerOverview } from '../hooks/useMitfahrerOverview'
import { buildAwayStats } from '../lib/awayStats'
import { partitionFahrten } from '../lib/partitionFahrten'

type HomeView = 'calendar' | 'list'

export function HomePage() {
  const [activeView, setActiveView] = useState<HomeView>('list')
  const { user } = useAuth()
  const { fahrten, loading, error } = useFahrten()
  const { upcoming, past } = partitionFahrten(fahrten)
  const fahrtIds = useMemo(() => fahrten.map((fahrt) => fahrt.id), [fahrten])
  const {
    byFahrt: mitfahrerByFahrt,
    loading: mitfahrerLoading,
    error: mitfahrerError,
  } = useMitfahrerOverview(fahrtIds)
  const { winningByFahrt: abfahrtByFahrt } = useAbfahrtAbstimmungOverview(fahrtIds)
  const awayStats = useMemo(
    () => buildAwayStats(fahrten, mitfahrerByFahrt, user?.id),
    [fahrten, mitfahrerByFahrt, user?.id],
  )

  return (
    <AppShell title="Auswärtsfahrten">
      {loading ? (
        <p className="text-center text-white/80">Fahrten werden geladen …</p>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-100" role="alert">
          {error}
          <span className="mt-1 block text-white/70">
            Hast du die Datenbank-Migration in Supabase ausgeführt? (siehe README)
          </span>
        </p>
      ) : null}

      {!loading && !error && fahrten.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/30 bg-white/5 px-6 py-10 text-center">
          <p className="text-lg font-semibold">Noch keine Auswärtsfahrten</p>
          <p className="mt-2 text-sm text-white/70">
            Lege die erste Fahrt an – Gegner, Stadion und Anpfiff reichen zum Start.
          </p>
          <Link
            to="/fahrten/neu"
            className="mt-6 inline-block rounded-lg bg-white px-5 py-2.5 font-semibold text-hertha-blue transition hover:bg-white/90"
          >
            Erste Fahrt anlegen
          </Link>
        </div>
      ) : null}

      {!loading && fahrten.length > 0 ? (
        <div className="space-y-8">
          <AwayStatsCard stats={awayStats} loading={mitfahrerLoading} error={mitfahrerError} />

          <div className="inline-flex rounded-xl bg-white/10 p-1">
            {[
              { id: 'list', label: 'Liste' },
              { id: 'calendar', label: 'Kalender' },
            ].map((view) => (
              <button
                key={view.id}
                type="button"
                onClick={() => setActiveView(view.id as HomeView)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  activeView === view.id
                    ? 'bg-white text-hertha-blue shadow-sm'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>

          {activeView === 'calendar' ? (
            <CalendarView fahrten={fahrten} abfahrtByFahrt={abfahrtByFahrt} />
          ) : (
            <div className="space-y-8">
              <FahrtSection
                title="Kommende Fahrten"
                fahrten={upcoming}
                mitfahrerByFahrt={mitfahrerByFahrt}
                abfahrtByFahrt={abfahrtByFahrt}
                emptyHint="Keine kommenden Fahrten – Zeit für die nächste Auswärtsfahrt!"
              />
              <FahrtSection
                title="Vergangene Fahrten"
                fahrten={past}
                mitfahrerByFahrt={mitfahrerByFahrt}
                abfahrtByFahrt={abfahrtByFahrt}
                emptyHint="Noch keine vergangenen Fahrten im Archiv."
              />
            </div>
          )}
        </div>
      ) : null}
    </AppShell>
  )
}
