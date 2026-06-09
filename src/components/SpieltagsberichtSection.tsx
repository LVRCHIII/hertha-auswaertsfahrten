import { useState } from 'react'
import type { JSONContent } from '@tiptap/core'
import { BerichtEditor } from './BerichtEditor'
import { BerichtViewer } from './BerichtViewer'
import { BerichtBilderGalerie } from './BerichtBilderGalerie'
import { DashboardSection } from './DashboardSection'
import { ProfileAvatar } from './ProfileAvatar'
import { StarRating } from './StarRating'
import { VereinWappen } from './VereinWappen'
import { useSpieltagsbericht } from '../hooks/useSpieltagsbericht'
import { useToast } from '../contexts/ToastContext'
import { EMPTY_BERICHT_DOC, isBerichtEmpty } from '../lib/berichtContent'
import { displayNameFromProfile } from '../lib/displayName'
import { HERTHA_WAPPEN_URL, resolveGegnerWappen } from '../data/vereine'
import type { BerichtMeta } from '../types/bericht'

const updatedFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const EMPTY_META: BerichtMeta = {
  ergebnis_heim: null,
  ergebnis_gast: null,
  zuschauer: null,
  bewertung_spiel: null,
  bewertung_atmosphaere: null,
  bewertung_pommes: null,
}

type Props = {
  fahrtId: string
  currentUserId: string | undefined
  gegner?: string
}

export function SpieltagsberichtSection({ fahrtId, currentUserId, gegner }: Props) {
  const { bericht, loading, error, actionError, busy, save, remove } =
    useSpieltagsbericht(fahrtId)
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<JSONContent>(EMPTY_BERICHT_DOC)
  const [meta, setMeta] = useState<BerichtMeta>(EMPTY_META)

  const isAuthor = Boolean(currentUserId && bericht?.author_id === currentUserId)
  const canCreate = Boolean(currentUserId && !bericht)
  const authorName = displayNameFromProfile(bericht?.author ?? null)

  function setMetaField<K extends keyof BerichtMeta>(key: K, value: BerichtMeta[K]) {
    setMeta((prev) => ({ ...prev, [key]: value }))
  }

  function startEditing() {
    setDraft((bericht?.content_json as JSONContent) ?? EMPTY_BERICHT_DOC)
    setMeta({
      ergebnis_heim: bericht?.ergebnis_heim ?? null,
      ergebnis_gast: bericht?.ergebnis_gast ?? null,
      zuschauer: bericht?.zuschauer ?? null,
      bewertung_spiel: bericht?.bewertung_spiel ?? null,
      bewertung_atmosphaere: bericht?.bewertung_atmosphaere ?? null,
      bewertung_pommes: bericht?.bewertung_pommes ?? null,
    })
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
    setDraft(EMPTY_BERICHT_DOC)
    setMeta(EMPTY_META)
  }

  function hasSaveableContent() {
    if (!isBerichtEmpty(draft)) return true
    return Object.values(meta).some((v) => v !== null)
  }

  async function handleSave() {
    if (!currentUserId || !hasSaveableContent()) return

    const ok = await save(currentUserId, draft as Record<string, unknown>, meta)
    if (ok) {
      setEditing(false)
      toast.success('Bericht gespeichert!')
    } else if (actionError) {
      toast.error(actionError)
    }
  }

  async function handleDelete() {
    if (!bericht) return
    if (!window.confirm('Spieltagsbericht wirklich löschen?')) return

    const ok = await remove()
    if (ok) {
      setEditing(false)
      toast.success('Bericht gelöscht')
    } else if (actionError) {
      toast.error(actionError)
    }
  }

  // --- View: Spielinfo header (Ergebnis + Bewertungen) ---
  function renderSpielinfo() {
    const b = bericht!
    const hasErgebnis = b.ergebnis_heim !== null && b.ergebnis_gast !== null
    const hasBewertungen =
      b.bewertung_spiel !== null ||
      b.bewertung_atmosphaere !== null ||
      b.bewertung_pommes !== null

    if (!hasErgebnis && !hasBewertungen && !b.zuschauer) return null

    return (
      <div className="rounded-xl bg-slate-50 p-4 space-y-3">
        {hasErgebnis ? (
          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <VereinWappen src={resolveGegnerWappen(gegner ?? '') ?? ''} size="md" />
              <span className="text-[10px] text-slate-400">{gegner ?? 'Gegner'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-3xl font-black tabular-nums text-slate-900 tracking-tight leading-none">
                {b.ergebnis_heim}
              </span>
              <span className="text-3xl font-black text-slate-400 leading-none">:</span>
              <span className="text-3xl font-black tabular-nums text-slate-900 tracking-tight leading-none">
                {b.ergebnis_gast}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <VereinWappen src={HERTHA_WAPPEN_URL} size="md" />
              <span className="text-[10px] text-slate-400">Hertha BSC</span>
            </div>
          </div>
        ) : null}

        {b.zuschauer ? (
          <p className="text-center text-xs text-slate-500">
            👥 {b.zuschauer.toLocaleString('de-DE')} Zuschauer
          </p>
        ) : null}

        {hasBewertungen ? (
          <div className="flex justify-around pt-1">
            {b.bewertung_spiel !== null ? (
              <StarRating value={b.bewertung_spiel} readonly label="Spiel" emoji="⭐" />
            ) : null}
            {b.bewertung_atmosphaere !== null ? (
              <StarRating value={b.bewertung_atmosphaere} readonly label="Atmosphäre" emoji="🔥" />
            ) : null}
            {b.bewertung_pommes !== null ? (
              <StarRating value={b.bewertung_pommes} readonly label="Pommes" emoji="🍟" />
            ) : null}
          </div>
        ) : null}
      </div>
    )
  }

  // --- Edit: Spielinfo inputs ---
  function renderSpielinfoEdit() {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Spielinfo</p>

        {/* Ergebnis */}
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Ergebnis</p>
          <div className="flex items-center gap-3">
            <VereinWappen src={resolveGegnerWappen(gegner ?? '') ?? ''} size="sm" />
            {(['ergebnis_heim', 'ergebnis_gast'] as const).map((field, i) => (
              <div key={field} className={`flex items-center gap-3 ${i === 0 ? '' : ''}`}>
                {i === 1 && <span className="text-xl font-bold text-slate-400">:</span>}
                <div className="flex flex-col items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => setMetaField(field, Math.min(99, (meta[field] ?? 0) + 1))}
                    className="flex h-6 w-8 items-center justify-center rounded-md bg-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-300 active:bg-slate-400 transition"
                  >+</button>
                  <span className="flex h-10 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-xl font-bold text-slate-900 tabular-nums">
                    {meta[field] ?? '–'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMetaField(field, meta[field] !== null && meta[field]! > 0 ? meta[field]! - 1 : null)}
                    className="flex h-6 w-8 items-center justify-center rounded-md bg-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-300 active:bg-slate-400 transition"
                  >−</button>
                </div>
              </div>
            ))}
            <VereinWappen src={HERTHA_WAPPEN_URL} size="sm" />
          </div>
        </div>

        {/* Zuschauer */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Zuschauer (optional)
          </label>
          <input
            type="number"
            min={0}
            value={meta.zuschauer ?? ''}
            onChange={(e) =>
              setMetaField('zuschauer', e.target.value === '' ? null : Number(e.target.value))
            }
            placeholder="z. B. 28000"
            className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-card-accent focus:ring-2 focus:ring-card-accent/30"
          />
        </div>

        {/* Bewertungen */}
        <div>
          <p className="mb-3 text-sm font-medium text-slate-700">Bewertungen</p>
          <div className="flex justify-around">
            <StarRating
              value={meta.bewertung_spiel}
              onChange={(v) => setMetaField('bewertung_spiel', v === 0 ? null : v)}
              label="Spiel"
              emoji="⭐"
            />
            <StarRating
              value={meta.bewertung_atmosphaere}
              onChange={(v) => setMetaField('bewertung_atmosphaere', v === 0 ? null : v)}
              label="Atmosphäre"
              emoji="🔥"
            />
            <StarRating
              value={meta.bewertung_pommes}
              onChange={(v) => setMetaField('bewertung_pommes', v === 0 ? null : v)}
              label="Pommes"
              emoji="🍟"
            />
          </div>
        </div>
      </div>
    )
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
          {/* VIEW MODE */}
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

              {renderSpielinfo()}

              <BerichtViewer contentJson={bericht.content_json} />

              <BerichtBilderGalerie
                fahrtId={fahrtId}
                currentUserId={isAuthor ? currentUserId : undefined}
                readonly={!isAuthor}
              />

              {isAuthor ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={startEditing}
                    className="rounded-lg bg-card-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
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

          {/* EMPTY STATE */}
          {!bericht && !editing ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Halte Erinnerungen an den Spieltag fest — Ergebnis, Bewertungen und einen Bericht.
              </p>
              {canCreate ? (
                <button
                  type="button"
                  onClick={startEditing}
                  className="rounded-lg bg-card-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Bericht schreiben
                </button>
              ) : (
                <p className="text-sm text-slate-500">
                  Melde dich an, um einen Bericht zu schreiben.
                </p>
              )}
            </div>
          ) : null}

          {/* EDIT MODE */}
          {editing && currentUserId ? (
            <div className="space-y-4">
              {renderSpielinfoEdit()}

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Freitext
                </p>
                <BerichtEditor
                  initialContent={draft}
                  onChange={setDraft}
                />
              </div>

              <BerichtBilderGalerie
                fahrtId={fahrtId}
                currentUserId={currentUserId}
              />

              {actionError ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {actionError}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy || !hasSaveableContent()}
                  onClick={() => void handleSave()}
                  className="rounded-lg bg-card-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
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
