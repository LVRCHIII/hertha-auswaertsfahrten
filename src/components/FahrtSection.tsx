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
}

export function FahrtSection({
  title,
  fahrten,
  mitfahrerByFahrt,
  abfahrtByFahrt,
  emptyHint,
}: FahrtSectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">{title}</h2>
      {fahrten.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/25 px-4 py-6 text-center text-sm text-white/60">
          {emptyHint ?? 'Keine Fahrten in diesem Bereich.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {fahrten.map((fahrt) => (
            <li key={fahrt.id}>
              <FahrtCard
                fahrt={fahrt}
                mitfahrer={mitfahrerByFahrt?.get(fahrt.id) ?? []}
                abfahrt={abfahrtByFahrt?.get(fahrt.id) ?? null}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
