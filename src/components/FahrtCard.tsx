import { Link } from 'react-router-dom'
import { MatchupWappen } from './MatchupWappen'
import { MitfahrerAvatarStack } from './MitfahrerAvatarStack'
import { formatAnpfiff, formatSpielDatum, isUpcoming } from '../lib/fahrtFormat'
import { formatUhrzeit } from '../lib/fahrtFormat'
import type { WinningAbfahrt } from '../types/abfahrt'
import type { Fahrt } from '../types/fahrt'
import type { MitfahrerEintrag } from '../types/social'

type FahrtCardProps = {
  fahrt: Fahrt
  mitfahrer?: MitfahrerEintrag[]
  abfahrt?: WinningAbfahrt | null
  hero?: boolean
}

export function FahrtCard({ fahrt, mitfahrer = [], abfahrt = null, hero = false }: FahrtCardProps) {
  const upcoming = isUpcoming(fahrt.spiel_at)
  const hasMitfahrer = mitfahrer.length > 0

  if (hero && upcoming) {
    return (
      <Link
        to={`/fahrten/${fahrt.id}`}
        className="group block overflow-hidden rounded-3xl bg-white text-slate-900 shadow-[0_4px_24px_rgb(0_0_0/0.10)] transition-all duration-200 hover:shadow-[0_8px_32px_rgb(0_0_0/0.15)] hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0"
      >
        <div className="h-1 bg-card-accent" />

        <div className="p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card-accent/10 px-3 py-1 text-xs font-semibold text-card-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-card-accent" />
              Nächste Fahrt
            </span>
            {hasMitfahrer ? (
              <MitfahrerAvatarStack entries={mitfahrer} ringClassName="ring-2 ring-white" />
            ) : null}
          </div>

          <MatchupWappen gegner={fahrt.gegner} size="md" />

          <div className="mt-4">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">{fahrt.gegner}</h3>
            <p className="mt-0.5 text-sm text-slate-400">{fahrt.stadion}</p>
          </div>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <p className="text-sm text-slate-400">
              {formatSpielDatum(fahrt.spiel_at)} · {formatAnpfiff(fahrt.spiel_at)} Uhr
            </p>
            {abfahrt ? (
              <div className="rounded-2xl bg-card-accent px-4 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Abfahrt</p>
                <p className="text-2xl font-bold tabular-nums text-white">{formatUhrzeit(abfahrt.time)} Uhr</p>
              </div>
            ) : null}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/fahrten/${fahrt.id}`}
      className={`group relative block rounded-2xl transition-all duration-200 active:scale-[0.99] ${
        upcoming
          ? 'bg-white text-slate-900 shadow-[0_2px_12px_rgb(0_0_0/0.07)] hover:shadow-[0_4px_20px_rgb(0_0_0/0.12)] hover:-translate-y-px'
          : 'bg-shell-fg/6 text-shell-fg/80 hover:bg-shell-fg/10'
      }`}
    >
      <div className={`p-4 ${hasMitfahrer ? 'pb-12' : ''}`}>
        {upcoming ? (
          <div className="mb-3">
            <MatchupWappen gegner={fahrt.gegner} />
          </div>
        ) : null}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold tracking-tight leading-tight">{fahrt.gegner}</h3>
            <p className="mt-0.5 truncate text-sm opacity-50">{fahrt.stadion}</p>
          </div>
          {upcoming ? (
            <span className="shrink-0 rounded-lg bg-card-accent/10 px-2.5 py-0.5 text-xs font-semibold text-card-accent">
              Kommend
            </span>
          ) : (
            <span className="shrink-0 rounded-lg bg-shell-fg/10 px-2.5 py-0.5 text-xs font-medium opacity-60">
              Archiv
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className={`font-medium ${upcoming ? 'text-slate-700' : ''}`}>{formatSpielDatum(fahrt.spiel_at)}</span>
          <span className="opacity-30">·</span>
          <span className="opacity-60">{formatAnpfiff(fahrt.spiel_at)} Uhr</span>
          {abfahrt ? (
            <>
              <span className="opacity-30">·</span>
              <span className={`font-semibold tabular-nums ${upcoming ? 'text-card-accent' : ''}`}>
                Abfahrt {formatUhrzeit(abfahrt.time)}
              </span>
            </>
          ) : null}
        </div>
      </div>

      {hasMitfahrer ? (
        <MitfahrerAvatarStack
          entries={mitfahrer}
          ringClassName={upcoming ? 'ring-2 ring-white' : 'ring-2 ring-shell-fg/30'}
          className="absolute bottom-3 right-4"
        />
      ) : null}
    </Link>
  )
}
