import { useEffect, useState } from 'react'
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

function useCountdown(targetIso: string) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])
  const diff = Math.max(0, new Date(targetIso).getTime() - now)
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  return { days, hours, minutes }
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-score text-3xl leading-none text-shell-fg sm:text-4xl">
        {String(value).padStart(2, '0')}
      </span>
      <span className="font-display-wide mt-1 text-[9px] text-shell-fg/40">{label}</span>
    </div>
  )
}

function HeroCard({ fahrt, mitfahrer, abfahrt }: Required<Pick<FahrtCardProps, 'fahrt' | 'mitfahrer' | 'abfahrt'>>) {
  const { days, hours, minutes } = useCountdown(fahrt.spiel_at)
  const hasMitfahrer = mitfahrer.length > 0

  return (
    <Link
      to={`/fahrten/${fahrt.id}`}
      className="glass-card noise-overlay group relative block overflow-hidden rounded-3xl transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0"
    >
      <div className="accent-line h-1" />

      {/* Riesiger Gegner-Schriftzug als Hintergrund-Ebene */}
      <div
        aria-hidden
        className="font-display pointer-events-none absolute -right-3 -bottom-5 select-none text-[7rem] leading-none text-shell-fg/[0.05] sm:text-[9rem]"
      >
        {fahrt.gegner.split(' ').pop()}
      </div>

      <div className="relative p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-shell-fg/15 bg-shell-fg/8 px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-shell-cta-bg" />
            <span className="font-display-wide text-[9px] text-shell-fg/70">Nächste Fahrt</span>
          </span>
          {hasMitfahrer ? (
            <MitfahrerAvatarStack entries={mitfahrer} ringClassName="ring-2 ring-shell-bg" />
          ) : null}
        </div>

        <MatchupWappen gegner={fahrt.gegner} size="md" />

        <div className="mt-5">
          <h3 className="font-display text-3xl leading-[0.95] text-shell-fg sm:text-5xl">{fahrt.gegner}</h3>
          <p className="mt-2 text-sm text-shell-fg/50">
            {fahrt.stadion} · {formatSpielDatum(fahrt.spiel_at)} · {formatAnpfiff(fahrt.spiel_at)} Uhr
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4" aria-label={`Anpfiff in ${days} Tagen, ${hours} Stunden, ${minutes} Minuten`}>
            <CountdownUnit value={days} label="Tage" />
            <span className="font-score pb-4 text-2xl text-shell-fg/25">:</span>
            <CountdownUnit value={hours} label="Std" />
            <span className="font-score pb-4 text-2xl text-shell-fg/25">:</span>
            <CountdownUnit value={minutes} label="Min" />
          </div>

          {abfahrt ? (
            <div className="rounded-2xl bg-shell-cta-bg px-4 py-2.5 shadow-lg shadow-black/25">
              <p className="font-display-wide text-[9px] text-shell-cta-fg/60">Abfahrt</p>
              <p className="font-score text-2xl text-shell-cta-fg">{formatUhrzeit(abfahrt.time)} Uhr</p>
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

export function FahrtCard({ fahrt, mitfahrer = [], abfahrt = null, hero = false }: FahrtCardProps) {
  const upcoming = isUpcoming(fahrt.spiel_at)
  const hasMitfahrer = mitfahrer.length > 0

  if (hero && upcoming) {
    return <HeroCard fahrt={fahrt} mitfahrer={mitfahrer} abfahrt={abfahrt} />
  }

  return (
    <Link
      to={`/fahrten/${fahrt.id}`}
      className={`group relative block rounded-2xl transition-all duration-200 active:scale-[0.99] ${
        upcoming
          ? 'glass-card hover:-translate-y-px'
          : 'border border-shell-fg/8 bg-shell-fg/4 text-shell-fg/70 hover:bg-shell-fg/8'
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
            <h3 className="font-display truncate text-lg leading-tight text-shell-fg">{fahrt.gegner}</h3>
            <p className="mt-0.5 truncate text-sm text-shell-fg/45">{fahrt.stadion}</p>
          </div>
          {upcoming ? (
            <span className="font-display-wide shrink-0 rounded-md border border-shell-fg/15 px-2 py-1 text-[9px] text-shell-fg/60">
              Kommend
            </span>
          ) : (
            <span className="font-display-wide shrink-0 rounded-md border border-shell-fg/10 px-2 py-1 text-[9px] text-shell-fg/35">
              Archiv
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-shell-fg/70">
          <span className="font-medium">{formatSpielDatum(fahrt.spiel_at)}</span>
          <span className="text-shell-fg/25">·</span>
          <span className="text-shell-fg/50">{formatAnpfiff(fahrt.spiel_at)} Uhr</span>
          {abfahrt ? (
            <>
              <span className="text-shell-fg/25">·</span>
              <span className="font-score text-shell-fg">Abfahrt {formatUhrzeit(abfahrt.time)}</span>
            </>
          ) : null}
        </div>
      </div>

      {hasMitfahrer ? (
        <MitfahrerAvatarStack
          entries={mitfahrer}
          ringClassName="ring-2 ring-shell-bg"
          className="absolute bottom-3 right-4"
        />
      ) : null}
    </Link>
  )
}
