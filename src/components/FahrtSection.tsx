import { FahrtCard } from './FahrtCard'
import type { Fahrt } from '../types/fahrt'
import type { WinningAbfahrt } from '../types/abfahrt'
import type { MitfahrerEintrag } from '../types/social'

type FahrtSectionProps = {
  title: string
  fahrten: Fahrt[]
  mitfahrerByFahrt?: Map<string, MitfahrerEintrag[]>
  abfahrtByFahrt?: Map<string, WinningAbfahrt>
  emptyHint?: string
  heroFirst?: boolean
  loading?: boolean
}

function FahrtCardSkeleton({ hero = false }: { hero?: boolean }) {
  if (hero) {
    return (
      <div className="animate-pulse rounded-3xl bg-white/10 p-5">
        <div className="mb-4 h-6 w-28 rounded-full bg-white/15" />
        <div className="mb-4 flex gap-3">
          <div className="h-10 w-10 rounded-full bg-white/15" />
          <div className="h-10 w-10 rounded-full bg-white/15" />
        </div>
        <div className="h-5 w-40 rounded-lg bg-white/15" />
        <div className="mt-2 h-4 w-32 rounded-lg bg-white/10" />
        <div className="mt-5 h-4 w-48 rounded-lg bg-white/10" />
      </div>
    )
  }
  return (
    <div className="animate-pulse rounded-2xl bg-white/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-36 rounded-lg bg-white/15" />
          <div className="h-3 w-24 rounded-lg bg-white/10" />
        </div>
        <div className="h-5 w-16 rounded-full bg-white/10" />
      </div>
      <div className="mt-3 flex gap-3">
        <div className="h-3 w-20 rounded-lg bg-white/10" />
        <div className="h-3 w-24 rounded-lg bg-white/10" />
      </div>
    </div>
  )
}

export function FahrtSection({
  title,
  fahrten,
  mitfahrerByFahrt,
  abfahrtByFahrt,
  emptyHint,
  heroFirst = false,
  loading = false,
}: FahrtSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="font-display-wide text-[11px] text-shell-fg/50">{title}</h2>
        {!loading && fahrten.length > 0 ? (
          <span className="rounded-md bg-shell-fg/10 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-shell-fg/50">
            {fahrten.length}
          </span>
        ) : null}
      </div>

      {loading ? (
        <ul className="space-y-3">
          <li><FahrtCardSkeleton hero={heroFirst} /></li>
          <li><FahrtCardSkeleton /></li>
        </ul>
      ) : fahrten.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-shell-fg/20 px-4 py-8 text-center text-sm text-shell-fg/40">
          {emptyHint ?? 'Keine Fahrten in diesem Bereich.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {fahrten.map((fahrt, index) => (
            <li
              key={fahrt.id}
              style={{
                animationDelay: `${index * 60}ms`,
                animationFillMode: 'both',
              }}
              className="animate-[fadeSlideIn_0.3s_ease-out_both]"
            >
              <FahrtCard
                fahrt={fahrt}
                mitfahrer={mitfahrerByFahrt?.get(fahrt.id) ?? []}
                abfahrt={abfahrtByFahrt?.get(fahrt.id) ?? null}
                hero={heroFirst && index === 0}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
