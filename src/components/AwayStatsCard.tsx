import { Link } from 'react-router-dom'
import { formatStatsKilometers, type AwayStats } from '../lib/awayStats'
import { useCountUp } from '../lib/gsapFx'

type AwayStatsCardProps = {
  stats: AwayStats
  loading?: boolean
  error?: string | null
}

function CountTile({
  label,
  value,
  fallback,
  suffix = '',
  hint,
}: {
  label: string
  value: number | null
  fallback?: string
  suffix?: string
  hint?: string
}) {
  const ref = useCountUp(value ?? 0, { suffix })
  return (
    <div className="glass-card rounded-2xl px-4 py-4" data-reveal>
      <p className="font-display-wide text-[10px] text-shell-fg/45">{label}</p>
      {value === null ? (
        <p className="font-score mt-1.5 text-2xl text-shell-fg/50">{fallback}</p>
      ) : (
        <p className="font-score mt-1.5 text-3xl text-shell-fg sm:text-4xl">
          <span ref={ref}>0{suffix}</span>
        </p>
      )}
      {hint ? <p className="mt-1 text-xs text-shell-fg/40">{hint}</p> : null}
    </div>
  )
}

export function AwayStatsCard({ stats, loading = false, error = null }: AwayStatsCardProps) {
  const personal = stats.personal
  const missingDistances = stats.group.missingDistanceCount
  const personalKm =
    personal && personal.distanceMeters === 0 && personal.missingDistanceCount > 0
      ? null
      : Math.round((personal?.distanceMeters ?? 0) / 1000)
  const groupKm =
    stats.group.distanceMeters === 0 && missingDistances > 0
      ? null
      : Math.round(stats.group.distanceMeters / 1000)

  return (
    <section>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-display-wide text-[10px] text-shell-fg/40">Auswärtsstatistik</p>
          <h2 className="font-display mt-1 text-2xl text-shell-fg sm:text-3xl">Deine Saison in Zahlen</h2>
        </div>
        {loading ? <p className="text-sm text-shell-fg/50">Wird geladen …</p> : null}
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}

      {stats.ranking.length === 0 ? (
        <p className="glass-card mt-4 rounded-2xl px-4 py-6 text-center text-sm text-shell-fg/60">
          Noch keine Mitfahrer-Einträge. Sobald jemand bei einer Fahrt „Ich fahre mit" auswählt,
          entsteht hier die Auswärtsstatistik.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <CountTile
              label="Meine Fahrten"
              value={personal?.rideCount ?? 0}
              hint={personal?.longestTrip ? `Längste: ${personal.longestTrip.gegner}` : 'Nur Mitfahrer zählen'}
            />
            <CountTile
              label="Meine Kilometer"
              value={personalKm}
              fallback="Distanz fehlt"
              suffix=" km"
              hint={
                personal?.missingDistanceCount
                  ? `${personal.missingDistanceCount} Fahrt(en) ohne Distanz`
                  : 'Gespeicherte Routendistanz'
              }
            />
            <CountTile
              label="Gruppen-Kilometer"
              value={groupKm}
              fallback="Distanzen fehlen"
              suffix=" km"
              hint={`${stats.group.rideCount} Teilnahmen · ${stats.group.participantCount} Leute`}
            />
          </div>

          {stats.group.longestTrip ? (
            <div className="glass-card rounded-2xl px-4 py-3 text-sm text-shell-fg/75">
              Längste gespeicherte Fahrt:{' '}
              <Link
                to={`/fahrten/${stats.group.longestTrip.fahrtId}`}
                className="font-semibold text-shell-fg underline decoration-shell-fg/30 underline-offset-2 transition-opacity hover:opacity-80"
              >
                {stats.group.longestTrip.gegner}
              </Link>{' '}
              mit {formatStatsKilometers(stats.group.longestTrip.distanceMeters)}.
            </div>
          ) : null}

          <div>
            <h3 className="font-display-wide text-[10px] text-shell-fg/40">Ranking</h3>
            <div className="glass-card mt-2 overflow-hidden rounded-2xl">
              {stats.ranking.map((entry, index) => (
                <div
                  key={entry.userId}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-shell-fg/8 px-4 py-2.5 last:border-b-0"
                >
                  <span className="font-score flex h-7 w-7 items-center justify-center rounded-lg bg-shell-cta-bg text-sm text-shell-cta-fg">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-shell-fg">{entry.name}</p>
                    <p className="text-xs text-shell-fg/45">
                      {entry.rideCount} Fahrt(en)
                      {entry.longestTrip ? ` · längste: ${entry.longestTrip.gegner}` : ''}
                    </p>
                  </div>
                  <p className="font-score text-sm text-shell-fg/85">
                    {entry.distanceMeters === 0 && entry.missingDistanceCount > 0
                      ? 'offen'
                      : formatStatsKilometers(entry.distanceMeters)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {missingDistances > 0 ? (
            <p className="text-xs text-shell-fg/40">
              {missingDistances} Teilnahme(n) haben noch keine gespeicherte Distanz. Öffne das
              jeweilige Dashboard mit aktivem Google-Maps-Key, damit die Route gespeichert wird.
            </p>
          ) : null}
        </div>
      )}
    </section>
  )
}
