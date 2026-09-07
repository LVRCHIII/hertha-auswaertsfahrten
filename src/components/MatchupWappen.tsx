import { HERTHA_WAPPEN_URL, resolveGegnerWappen } from '../data/vereine'
import { VereinWappen } from './VereinWappen'

type MatchupWappenProps = {
  gegner: string
  size?: 'sm' | 'md'
  /** true = Hertha spielt zuhause → Hertha-Wappen links (Heimmannschaft), Gegner rechts */
  istHeimspiel?: boolean
}

export function MatchupWappen({ gegner, size = 'md', istHeimspiel = false }: MatchupWappenProps) {
  const gegnerWappen = resolveGegnerWappen(gegner)
  const hertha = <VereinWappen src={HERTHA_WAPPEN_URL} size={size} />
  const gegnerBadge = <VereinWappen src={gegnerWappen ?? ''} size={size} />

  return (
    <div className="flex shrink-0 items-center gap-2" aria-hidden>
      {istHeimspiel ? hertha : gegnerBadge}
      <span className="text-lg font-light text-slate-400">–</span>
      {istHeimspiel ? gegnerBadge : hertha}
    </div>
  )
}
