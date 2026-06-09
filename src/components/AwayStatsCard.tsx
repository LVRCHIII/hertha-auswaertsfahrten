import { Link } from 'react-router-dom'
import { formatStatsKilometers, type AwayStats } from '../lib/awayStats'

type AwayStatsCardProps = {
  stats: AwayStats
  loading?: boolean
  error?: string | null
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-slate-50/80 px-4 py-4 ring-1 ring-slate-200/60">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-card-accent">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  )
}

export function AwayStatsCard({ stats, loading = false, error = null }: AwayStatsCardProps) {
  const personal = stats.personal
  const missingDistances = stats.group.missingDistanceCount
  const personalDistanceValue =
    personal && personal.distanceMeters === 0 && personal.missingDistanceCount > 0
      ? 'Distanz fehlt'
      : formatStatsKilometers(personal?.distanceMeters ?? 0)
  const groupDistanceValue =
    stats.group.distanceMeters === 0 && missingDistances > 0
      ? 'Distanzen fehlen'
      : formatStatsKilometers(stats.group.distanceMeters)

  return (
    <section className="rounded-3xl bg-white p-5 text-slate-900 shadow-[0_4px_24px_rgb(0_0_0/0.09)] sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-card-accent/60">
            Auswärtsstatistik
          </p>
          <h2 className="text-xl font-bold tracking-tight text-card-accent">Deine Saison in Zahlen</h2>
        </div>
        {loading ? <p className="text-sm text-slate-500">Statistik wird geladen …</p> : null}
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {stats.ranking.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
          Noch keine Mitfahrer-Einträge. Sobald jemand bei einer Fahrt „Ich fahre mit“ auswählt,
          entsteht hier die Auswärtsstatistik.
        </p>
      ) : (
        <div className="mt-4 space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile
              label="Meine Fahrten"
              value={String(personal?.rideCount ?? 0)}
              hint={
                personal?.longestTrip
                  ? `Längste: ${personal.longestTrip.gegner}`
                  : 'Nur Mitfahrer zählen'
              }
            />
            <StatTile
              label="Meine Kilometer"
              value={personalDistanceValue}
              hint={
                personal?.missingDistanceCount
                  ? `${personal.missingDistanceCount} Fahrt(en) ohne Distanz`
                  : 'Gespeicherte Routendistanz'
              }
            />
            <StatTile
              label="Gruppen-Kilometer"
              value={groupDistanceValue}
              hint={`${stats.group.rideCount} Teilnahmen · ${stats.group.participantCount} Leute`}
            />
          </div>

          {stats.group.longestTrip ? (
            <div className="rounded-xl bg-card-accent/10 px-4 py-3 text-sm text-card-accent">
              Längste gespeicherte Fahrt:{' '}
              <Link
                to={`/fahrten/${stats.group.longestTrip.fahrtId}`}
                className="font-semibold underline decoration-card-accent/30 underline-offset-2"
              >
                {stats.group.longestTrip.gegner}
              </Link>{' '}
              mit {formatStatsKilometers(stats.group.longestTrip.distanceMeters)}.
            </div>
          ) : null}

          <div>
            <h3 className="text-sm font-semibold text-slate-400">Ranking</h3>
            <div className="mt-2 overflow-hidden rounded-2xl border border-slate-100">
              {stats.ranking.map((entry, index) => (
                <div
                  key={entry.userId}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-slate-100 px-3 py-2 last:border-b-0"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-card-accent text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{entry.name}</p>
                    <p className="text-xs text-slate-500">
                      {entry.rideCount} Fahrt(en)
                      {entry.longestTrip ? ` · längste: ${entry.longestTrip.gegner}` : ''}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-card-accent">
                    {entry.distanceMeters === 0 && entry.missingDistanceCount > 0
                      ? 'offen'
                      : formatStatsKilometers(entry.distanceMeters)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {missingDistances > 0 ? (
            <p className="text-xs text-slate-500">
              {missingDistances} Teilnahme(n) haben noch keine gespeicherte Distanz. Öffne das
              jeweilige Dashboard mit aktivem Google-Maps-Key, damit die Route gespeichert wird.
            </p>
          ) : null}
        </div>
      )}
    </section>
  )
}
