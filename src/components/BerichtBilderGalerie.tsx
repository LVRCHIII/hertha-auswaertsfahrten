import { useRef, useState } from 'react'
import { useBerichtBilder } from '../hooks/useBerichtBilder'

type Props = {
  fahrtId: string
  currentUserId?: string
  readonly?: boolean
}

export function BerichtBilderGalerie({ fahrtId, currentUserId, readonly = false }: Props) {
  const { bilder, loading, busy, error, addBild, removeBild } = useBerichtBilder(fahrtId)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || !currentUserId) return
    for (const file of Array.from(files)) {
      await addBild(currentUserId, file)
    }
  }

  if (loading) return null

  const canEdit = !readonly && Boolean(currentUserId)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Bilder {bilder.length > 0 ? `(${bilder.length})` : ''}
        </p>
        {canEdit ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50 transition"
          >
            {busy ? 'Wird hochgeladen …' : '+ Bilder hinzufügen'}
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {bilder.length === 0 && !canEdit ? null : bilder.length === 0 ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-8 text-sm text-slate-400 hover:border-card-accent hover:text-card-accent transition disabled:opacity-50"
        >
          <span className="text-2xl">📷</span>
          <span>Fotos vom Spieltag hinzufügen</span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {bilder.map((bild) => (
            <div
              key={bild.id}
              className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100"
            >
              <img
                src={bild.url}
                alt=""
                className="h-full w-full cursor-pointer object-cover transition group-hover:opacity-90"
                onClick={() => setLightbox(bild.url)}
              />
              {canEdit ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void removeBild(bild.id, bild.path)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/80 disabled:opacity-40 text-xs font-bold"
                  aria-label="Bild entfernen"
                >
                  ×
                </button>
              ) : null}
            </div>
          ))}
          {canEdit ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-2xl text-slate-300 hover:border-card-accent hover:text-card-accent transition disabled:opacity-50"
              aria-label="Bild hinzufügen"
            >
              +
            </button>
          ) : null}
        </div>
      )}

      {canEdit ? (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => { void handleFiles(e.target.files); e.target.value = '' }}
        />
      ) : null}

      {lightbox ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt=""
            className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 text-xl font-bold"
          >
            ×
          </button>
        </div>
      ) : null}
    </div>
  )
}
