import { HERTHA_WAPPEN_URL, resolveGegnerWappen } from '../data/vereine'
import { VereinWappen } from './VereinWappen'

type MatchupWappenProps = {
  gegner: string
  size?: 'sm' | 'md'
}

export function MatchupWappen({ gegner, size = 'md' }: MatchupWappenProps) {
  const gegnerWappen = resolveGegnerWappen(gegner)

  return (
    <div className="flex shrink-0 items-center gap-2" aria-hidden>
      <VereinWappen src={HERTHA_WAPPEN_URL} size={size} />
      <span className="text-lg font-light text-slate-400">–</span>
      <VereinWappen src={gegnerWappen ?? ''} size={size} />
    </div>
  )
}
