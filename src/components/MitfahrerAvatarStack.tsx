import { ProfileAvatar } from './ProfileAvatar'
import { displayNameFromProfile } from '../lib/displayName'
import type { MitfahrerEintrag } from '../types/social'

type MitfahrerAvatarStackProps = {
  entries: MitfahrerEintrag[]
  maxVisible?: number
  /** Für helle Karten (kommende Fahrten) */
  ringClassName?: string
  className?: string
}

export function MitfahrerAvatarStack({
  entries,
  maxVisible = 5,
  ringClassName = 'ring-2 ring-white',
  className = '',
}: MitfahrerAvatarStackProps) {
  if (entries.length === 0) return null

  const visible = entries.slice(0, maxVisible)
  const overflow = entries.length - visible.length
  const label =
    entries.length === 1
      ? '1 Mitfahrer'
      : `${entries.length} Mitfahrer`

  return (
    <div
      className={`flex items-center ${className}`}
      title={label}
      aria-label={label}
    >
      {visible.map((entry, index) => {
        const name = displayNameFromProfile(entry.profile)
        return (
          <ProfileAvatar
            key={entry.user_id}
            name={name}
            avatarUrl={entry.profile?.avatar_url}
            size="sm"
            className={`${index > 0 ? '-ml-2.5' : ''} ${ringClassName} relative`}
            style={{ zIndex: visible.length - index }}
          />
        )
      })}
      {overflow > 0 ? (
        <span
          className={`-ml-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 ${ringClassName} relative`}
          style={{ zIndex: 0 }}
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  )
}
