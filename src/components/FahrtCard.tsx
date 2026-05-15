import { formatAnpfiff, formatSpielDatum, isUpcoming } from '../lib/fahrtFormat'
import type { Fahrt } from '../types/fahrt'

type FahrtCardProps = {
  fahrt: Fahrt
}

export function FahrtCard({ fahrt }: FahrtCardProps) {
  const upcoming = isUpcoming(fahrt.spiel_at)

  return (
    <article
      className={`rounded-xl border p-4 shadow-sm ${
        upcoming
          ? 'border-hertha-mid/50 bg-white text-slate-900 ring-2 ring-hertha-mid/30'
          : 'border-white/20 bg-white/10 text-white/90'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold">{fahrt.gegner}</h3>
          <p className="mt-1 text-sm opacity-80">{fahrt.stadion}</p>
        </div>
        {upcoming ? (
          <span className="shrink-0 rounded-full bg-hertha-blue px-2.5 py-0.5 text-xs font-semibold text-white">
            Kommend
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
            Archiv
          </span>
        )}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div>
          <dt className="opacity-60">Datum</dt>
          <dd className="font-medium">{formatSpielDatum(fahrt.spiel_at)}</dd>
        </div>
        <div>
          <dt className="opacity-60">Anpfiff</dt>
          <dd className="font-medium">{formatAnpfiff(fahrt.spiel_at)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="opacity-60">Start</dt>
          <dd className="font-medium">{fahrt.startpunkt}</dd>
        </div>
      </dl>
    </article>
  )
}
