import { useState } from 'react'
import type { JSONContent } from '@tiptap/core'
import { BerichtEditor } from './BerichtEditor'
import { BerichtViewer } from './BerichtViewer'
import { DashboardSection } from './DashboardSection'
import { ProfileAvatar } from './ProfileAvatar'
import { useSpieltagsbericht } from '../hooks/useSpieltagsbericht'
import { EMPTY_BERICHT_DOC, isBerichtEmpty } from '../lib/berichtContent'
import { displayNameFromProfile } from '../lib/displayName'

const updatedFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

type SpieltagsberichtSectionProps = {
  fahrtId: string
  currentUserId: string | undefined
}

export function SpieltagsberichtSection({
  fahrtId,
  currentUserId,
}: SpieltagsberichtSectionProps) {
  const { bericht, loading, error, actionError, busy, save, remove } =
    useSpieltagsbericht(fahrtId)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<JSONContent>(EMPTY_BERICHT_DOC)

  const isAuthor = Boolean(currentUserId && bericht?.author_id === currentUserId)
  const canCreate = Boolean(currentUserId && !bericht)
  const authorName = displayNameFromProfile(bericht?.author ?? null)

  function startEditing() {
    setDraft((bericht?.content_json as JSONContent) ?? EMPTY_BERICHT_DOC)
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
    setDraft(EMPTY_BERICHT_DOC)
  }

  async function handleSave() {
    if (!currentUserId || isBerichtEmpty(draft)) return

    const ok = await save(currentUserId, draft as Record<string, unknown>)
    if (ok) setEditing(false)
  }

  async function handleDelete() {
    if (!bericht) return

    const confirmed = window.confirm('Spieltagsbericht wirklich löschen?')
    if (!confirmed) return

    const ok = await remove()
    if (ok) setEditing(false)
  }

  return (
    <DashboardSection title="Spieltagsbericht" compact>
      {loading ? <p className="text-sm text-slate-500">Wird geladen …</p> : null}

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <>
          {bericht && !editing ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <ProfileAvatar
                  name={authorName}
                  avatarUrl={bericht.author?.avatar_url}
                  size="sm"
                />
                <div className="min-w-0 text-sm">
                  <p className="font-medium text-slate-900">{authorName}</p>
                  <p className="text-slate-500">
                    Zuletzt bearbeitet{' '}
                    {updatedFormatter.format(new Date(bericht.updated_at))}
                  </p>
                </div>
              </div>

              <BerichtViewer contentJson={bericht.content_json} />

              {isAuthor ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={startEditing}
                    className="rounded-lg bg-hertha-mid px-4 py-2 text-sm font-semibold text-white transition hover:bg-hertha-blue"
                  >
                    Bearbeiten
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleDelete()}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    Löschen
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {!bericht && !editing ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Halte Erinnerungen an den Spieltag fest — mit Text, Listen und Fotos.
              </p>
              {canCreate ? (
                <button
                  type="button"
                  onClick={startEditing}
                  className="rounded-lg bg-hertha-mid px-4 py-2 text-sm font-semibold text-white transition hover:bg-hertha-blue"
                >
                  Bericht schreiben
                </button>
              ) : (
                <p className="text-sm text-slate-500">Melde dich an, um einen Bericht zu schreiben.</p>
              )}
            </div>
          ) : null}

          {editing && currentUserId ? (
            <div className="space-y-4">
              <BerichtEditor
                fahrtId={fahrtId}
                userId={currentUserId}
                initialContent={draft}
                onChange={setDraft}
              />

              {actionError ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {actionError}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy || isBerichtEmpty(draft)}
                  onClick={() => void handleSave()}
                  className="rounded-lg bg-hertha-mid px-4 py-2 text-sm font-semibold text-white transition hover:bg-hertha-blue disabled:opacity-60"
                >
                  {busy ? 'Wird gespeichert …' : 'Speichern'}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={cancelEditing}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </DashboardSection>
  )
}
