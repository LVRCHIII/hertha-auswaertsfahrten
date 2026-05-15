import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { FahrtSection } from '../components/FahrtSection'
import { useFahrten } from '../hooks/useFahrten'
import { useAbfahrtAbstimmungOverview } from '../hooks/useAbfahrtAbstimmungOverview'
import { useMitfahrerOverview } from '../hooks/useMitfahrerOverview'
import { partitionFahrten } from '../lib/partitionFahrten'

export function HomePage() {
  const { fahrten, loading, error } = useFahrten()
  const { upcoming, past } = partitionFahrten(fahrten)
  const fahrtIds = useMemo(() => fahrten.map((fahrt) => fahrt.id), [fahrten])
  const { byFahrt: mitfahrerByFahrt } = useMitfahrerOverview(fahrtIds)
  const { winningByFahrt: abfahrtByFahrt } = useAbfahrtAbstimmungOverview(fahrtIds)

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
      ) : null}
    </AppShell>
  )
}
