import { useState } from 'react'
import type { FormEvent } from 'react'
import { DashboardSection } from './DashboardSection'
import { ProfileAvatar } from './ProfileAvatar'
import { displayNameFromProfile } from '../lib/displayName'
import { useMitbringliste } from '../hooks/useMitbringliste'
import type { MitbringEintrag } from '../types/social'

type MitbringlisteSectionProps = {
  fahrtId: string
  currentUserId: string | undefined
}

function MitbringRow({
  entry,
  canDelete,
  onDelete,
  busy,
}: {
  entry: MitbringEintrag
  canDelete: boolean
  onDelete: (id: string) => void
  busy: boolean
}) {
  const name = displayNameFromProfile(entry.profile)

  return (
    <li className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <ProfileAvatar name={name} avatarUrl={entry.profile?.avatar_url} size="sm" />
        <div className="min-w-0">
          <p className="font-medium text-slate-900">{entry.item}</p>
          <p className="text-xs text-slate-500">{name}</p>
        </div>
      </div>
      {canDelete ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void onDelete(entry.id)}
          className="shrink-0 text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-60"
          aria-label={`${entry.item} entfernen`}
        >
          Entfernen
        </button>
      ) : null}
    </li>
  )
}

export function MitbringlisteSection({ fahrtId, currentUserId }: MitbringlisteSectionProps) {
  const { entries, loading, error, actionError, busy, addItem, removeItem } =
    useMitbringliste(fahrtId)
  const [item, setItem] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!currentUserId) return

    const added = await addItem(currentUserId, item)
    if (added) setItem('')
  }

  return (
    <DashboardSection
      title="Mitbringliste"
      badge={loading ? undefined : `${entries.length}`}
      compact
    >
      {loading ? <p className="text-sm text-slate-500">Wird geladen …</p> : null}

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <>
          {entries.length === 0 ? (
            <p className="text-sm text-slate-500">Noch nichts eingetragen.</p>
          ) : (
            <ul className="space-y-2">
              {entries.map((entry) => (
                <MitbringRow
                  key={entry.id}
                  entry={entry}
                  canDelete={entry.user_id === currentUserId}
                  onDelete={removeItem}
                  busy={busy}
                />
              ))}
            </ul>
          )}

          {currentUserId ? (
            <form onSubmit={(event) => void handleSubmit(event)} className="mt-4 flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(event) => setItem(event.target.value)}
                placeholder="z. B. Bier, Kuchen, Grillzange"
                maxLength={120}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-hertha-mid focus:outline-none focus:ring-2 focus:ring-hertha-mid/30"
              />
              <button
                type="submit"
                disabled={busy || !item.trim()}
                className="shrink-0 rounded-lg bg-hertha-mid px-4 py-2 text-sm font-semibold text-white transition hover:bg-hertha-blue disabled:opacity-60"
              >
                {busy ? '…' : 'Hinzufügen'}
              </button>
            </form>
          ) : null}

          {actionError ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {actionError}
            </p>
          ) : null}
        </>
      ) : null}
    </DashboardSection>
  )
}
