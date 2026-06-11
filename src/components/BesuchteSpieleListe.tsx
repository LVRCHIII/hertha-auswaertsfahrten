import { useMemo, useState } from 'react'
import { BesuchteSpielCard } from './BesuchteSpielCard'
import { SpielHinzufuegenForm } from './SpielHinzufuegenForm'
import type { GroupedSpiel, SpielKategorie } from '../types/futbology'

function kategorisiere(spiel: GroupedSpiel): 'auswaerts' | 'heim' | 'andere' {
  const heim = spiel.heim_team.toLowerCase()
  const gast = spiel.gast_team.toLowerCase()
  if (gast.includes('hertha')) return 'auswaerts'
  if (heim.includes('hertha')) return 'heim'
  return 'andere'
}

const FILTER_LABELS: Record<SpielKategorie, string> = {
  alle: 'Alle',
  auswaerts: 'Auswärts',
  heim: 'Heim',
  andere: 'Andere',
}

type Props = {
  spiele: GroupedSpiel[]
  loading: boolean
  error: string | null
  onReload: () => void
}

export function BesuchteSpieleListe({ spiele, loading, error, onReload }: Props) {
  const [kategorie, setKategorie] = useState<SpielKategorie>('alle')

  const filtered = useMemo(() => {
    if (kategorie === 'alle') return spiele
    return spiele.filter((s) => kategorisiere(s) === kategorie)
  }, [spiele, kategorie])

  if (loading) {
    return <p className="text-center text-white/80">Spiele werden geladen …</p>
  }

  if (error) {
    return (
      <p className="rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-100" role="alert">
        {error}
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['alle', 'auswaerts', 'heim', 'andere'] as SpielKategorie[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKategorie(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition active:scale-[0.96] ${
              kategorie === k
                ? 'bg-shell-cta-bg text-shell-cta-fg shadow-sm'
                : 'border border-shell-fg/15 bg-shell-fg/5 text-shell-fg/70 hover:bg-shell-fg/12 hover:text-shell-fg'
            }`}
          >
            {FILTER_LABELS[k]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/25 px-4 py-8 text-center text-sm text-white/60">
          {spiele.length === 0
            ? 'Noch keine Spiele importiert. Lade deine Futbology-CSV im Profil hoch.'
            : 'Keine Spiele in dieser Kategorie.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((spiel) => (
            <li key={`${spiel.datum}|${spiel.heim_team}|${spiel.gast_team}`}>
              <BesuchteSpielCard spiel={spiel} />
            </li>
          ))}
        </ul>
      )}

      <SpielHinzufuegenForm onAdded={onReload} />
    </div>
  )
}
