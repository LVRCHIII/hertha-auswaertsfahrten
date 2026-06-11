import { ProfileAvatar } from './ProfileAvatar'
import { VereinWappen } from './VereinWappen'
import { resolveGegnerWappen, HERTHA_WAPPEN_URL } from '../data/vereine'
import type { GroupedSpiel } from '../types/futbology'

function formatDatum(datum: string): string {
  return new Date(datum).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function resolveWappen(name: string): string {
  if (name.toLowerCase().includes('hertha')) return HERTHA_WAPPEN_URL
  return resolveGegnerWappen(name) ?? ''
}

export function BesuchteSpielCard({ spiel }: { spiel: GroupedSpiel }) {
  const maxVisible = 5
  const visible = spiel.attendees.slice(0, maxVisible)
  const overflow = spiel.attendees.length - visible.length

  const heimWappen = resolveWappen(spiel.heim_team)
  const gastWappen = resolveWappen(spiel.gast_team)

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-3">
        {/* Matchup Wappen */}
        <div className="flex shrink-0 items-center gap-1">
          <VereinWappen src={heimWappen} size="sm" />
          <span className="text-xs text-shell-fg/35">–</span>
          <VereinWappen src={gastWappen} size="sm" />
        </div>

        {/* Spielinfo */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-shell-fg">
            {spiel.heim_team} – {spiel.gast_team}
          </p>
          <p className="mt-0.5 text-xs text-shell-fg/45">
            {formatDatum(spiel.datum)}
            {spiel.stadion ? ` · ${spiel.stadion}` : ''}
            {spiel.liga ? ` · ${spiel.liga}` : ''}
          </p>
        </div>

        {/* Ergebnis */}
        {spiel.ergebnis ? (
          <span className="font-score shrink-0 rounded-lg bg-shell-cta-bg/15 px-2.5 py-1 text-sm text-shell-fg">
            {spiel.ergebnis}
          </span>
        ) : null}
      </div>

      {visible.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex">
            {visible.map((attendee, index) => (
              <ProfileAvatar
                key={attendee.user_id}
                name={attendee.display_name}
                avatarUrl={attendee.avatar_url}
                size="sm"
                className={`${index > 0 ? '-ml-2.5' : ''} relative ring-2 ring-white`}
                style={{ zIndex: visible.length - index }}
              />
            ))}
            {overflow > 0 ? (
              <span
                className="-ml-2.5 relative flex h-9 w-9 items-center justify-center rounded-full bg-shell-fg/15 text-xs font-bold text-shell-fg ring-2 ring-shell-bg"
                style={{ zIndex: 0 }}
              >
                +{overflow}
              </span>
            ) : null}
          </div>
          <p className="truncate text-xs text-shell-fg/45">
            {spiel.attendees.map((a) => a.display_name).join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}
