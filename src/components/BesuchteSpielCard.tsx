import { ProfileAvatar } from './ProfileAvatar'
import type { GroupedSpiel } from '../types/futbology'

function formatDatum(datum: string): string {
  return new Date(datum).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function BesuchteSpielCard({ spiel }: { spiel: GroupedSpiel }) {
  const maxVisible = 5
  const visible = spiel.attendees.slice(0, maxVisible)
  const overflow = spiel.attendees.length - visible.length

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">
            {spiel.heim_team} – {spiel.gast_team}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {formatDatum(spiel.datum)}
            {spiel.stadion ? ` · ${spiel.stadion}` : ''}
            {spiel.liga ? ` · ${spiel.liga}` : ''}
          </p>
        </div>
        {spiel.ergebnis ? (
          <span className="shrink-0 rounded-lg bg-hertha-blue/10 px-2.5 py-1 text-sm font-bold text-hertha-blue">
            {spiel.ergebnis}
          </span>
        ) : null}
      </div>

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
              className="-ml-2.5 relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 ring-2 ring-white"
              style={{ zIndex: 0 }}
            >
              +{overflow}
            </span>
          ) : null}
        </div>
        <p className="truncate text-xs text-slate-500">
          {spiel.attendees.map((a) => a.display_name).join(', ')}
        </p>
      </div>
    </div>
  )
}
