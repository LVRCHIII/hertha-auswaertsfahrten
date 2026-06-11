import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { AwayStatsCard } from '../components/AwayStatsCard'
import { BesuchteSpieleListe } from '../components/BesuchteSpieleListe'
import { CalendarView } from '../components/CalendarView'
import { FahrtSection } from '../components/FahrtSection'
import { useAuth } from '../contexts/AuthContext'
import { useFahrten } from '../hooks/useFahrten'
import { useAbfahrtAbstimmungOverview } from '../hooks/useAbfahrtAbstimmungOverview'
import { useFutbologySpiele } from '../hooks/useFutbologySpiele'
import { useMitfahrerOverview } from '../hooks/useMitfahrerOverview'
import { buildAwayStats } from '../lib/awayStats'
import { partitionFahrten } from '../lib/partitionFahrten'
import { useStaggerReveal } from '../lib/gsapFx'

type HomeView = 'calendar' | 'list' | 'spiele'

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
  const { spiele, loading: spieleLoading, error: spieleError, reload: reloadSpiele } = useFutbologySpiele()
  const ready = !loading && fahrten.length > 0
  const revealRef = useStaggerReveal<HTMLDivElement>([ready, activeView])

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
            className="mt-6 inline-block rounded-xl bg-shell-cta-bg px-5 py-2.5 font-semibold text-shell-cta-fg transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
          >
            Erste Fahrt anlegen
          </Link>
        </div>
      ) : null}

      {!loading && fahrten.length > 0 ? (
        <div ref={revealRef} className="space-y-8">
          <div data-reveal>
            <AwayStatsCard stats={awayStats} loading={mitfahrerLoading} error={mitfahrerError} />
          </div>

          <div data-reveal className="glass-card inline-flex rounded-xl p-1 gap-0.5">
            {[
              { id: 'list', label: 'Fahrten' },
              { id: 'spiele', label: 'Spiele' },
              { id: 'calendar', label: 'Kalender' },
            ].map((view) => (
              <button
                key={view.id}
                type="button"
                onClick={() => setActiveView(view.id as HomeView)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 active:scale-[0.97] ${
                  activeView === view.id
                    ? 'bg-shell-cta-bg text-shell-cta-fg shadow-sm'
                    : 'text-shell-fg/60 hover:bg-shell-fg/10 hover:text-shell-fg'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>

          <div data-reveal>
          {activeView === 'calendar' ? (
            <CalendarView fahrten={fahrten} abfahrtByFahrt={abfahrtByFahrt} />
          ) : activeView === 'spiele' ? (
            <BesuchteSpieleListe
              spiele={spiele}
              loading={spieleLoading}
              error={spieleError}
              onReload={reloadSpiele}
            />
          ) : (
            <div className="space-y-8">
              <FahrtSection
                title="Kommende Fahrten"
                fahrten={upcoming}
                mitfahrerByFahrt={mitfahrerByFahrt}
                abfahrtByFahrt={abfahrtByFahrt}
                emptyHint="Keine kommenden Fahrten – Zeit für die nächste Auswärtsfahrt!"
                heroFirst
                loading={loading}
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
        </div>
      ) : null}
    </AppShell>
  )
}
