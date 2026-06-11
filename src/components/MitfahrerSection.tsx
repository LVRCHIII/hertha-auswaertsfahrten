import { DashboardSection } from './DashboardSection'
import { ProfileAvatar } from './ProfileAvatar'
import { displayNameFromProfile } from '../lib/displayName'
import { useMitfahrer } from '../hooks/useMitfahrer'
import { useToast } from '../contexts/ToastContext'
import type { MitfahrerEintrag } from '../types/social'

type MitfahrerSectionProps = {
  fahrtId: string
  currentUserId: string | undefined
}

function MitfahrerRow({ entry, isSelf }: { entry: MitfahrerEintrag; isSelf: boolean }) {
  const name = displayNameFromProfile(entry.profile)

  return (
    <li className="flex items-center gap-3">
      <ProfileAvatar name={name} avatarUrl={entry.profile?.avatar_url} size="sm" />
      <span className="min-w-0 flex-1 font-medium text-shell-fg">
        {name}
        {isSelf ? <span className="ml-1 text-shell-fg/55">(du)</span> : null}
      </span>
    </li>
  )
}

export function MitfahrerSection({ fahrtId, currentUserId }: MitfahrerSectionProps) {
  const { entries, loading, error, actionError, busy, toggle } = useMitfahrer(fahrtId)
  const toast = useToast()

  const isJoined = currentUserId
    ? entries.some((entry) => entry.user_id === currentUserId)
    : false

  return (
    <DashboardSection
      title="Mitfahrer"
      badge={loading ? undefined : `${entries.length}`}
      compact
    >
      {loading ? <p className="text-sm text-shell-fg/55">Wird geladen …</p> : null}

      {error ? (
        <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <>
          {entries.length === 0 ? (
            <p className="text-sm text-shell-fg/55">Noch niemand angemeldet.</p>
          ) : (
            <ul className="space-y-2">
              {entries.map((entry) => (
                <MitfahrerRow
                  key={entry.user_id}
                  entry={entry}
                  isSelf={entry.user_id === currentUserId}
                />
              ))}
            </ul>
          )}

          {currentUserId ? (
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                const result = await toggle(currentUserId, isJoined)
                if (result?.error) {
                  toast.error(result.error)
                } else {
                  toast.success(isJoined ? 'Abgemeldet' : 'Angemeldet!')
                }
              }}
              className={`mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                isJoined
                  ? 'border border-shell-fg/15 bg-shell-fg/8 text-shell-fg/80 hover:bg-shell-fg/10'
                  : 'bg-shell-cta-bg text-shell-cta-fg hover:opacity-90'
              }`}
            >
              {busy ? 'Bitte warten …' : isJoined ? 'Abmelden' : 'Ich fahre mit'}
            </button>
          ) : null}

          {actionError ? (
            <p className="mt-2 text-sm text-red-300" role="alert">
              {actionError}
            </p>
          ) : null}
        </>
      ) : null}
    </DashboardSection>
  )
}
