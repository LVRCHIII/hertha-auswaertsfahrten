import { useRef, useState, type DragEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useToast } from '../contexts/ToastContext'
import { useBerichtBilder } from '../hooks/useBerichtBilder'
import type { BerichtBild } from '../lib/berichtBilderApi'
import { openPhotoLightbox } from '../lib/photoLightbox'
import { DashboardSection } from './DashboardSection'

type Props = {
  fahrtId: string
  currentUserId?: string
}

const createdAtFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function CameraIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4.75 7.75h2.1l1.1-2h8.1l1.1 2h2.1A1.75 1.75 0 0 1 21 9.5v8.75A1.75 1.75 0 0 1 19.25 20H4.75A1.75 1.75 0 0 1 3 18.25V9.5a1.75 1.75 0 0 1 1.75-1.75Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13.25" r="3.25" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function photoClassName(index: number, count: number): string {
  if (count === 1) return 'col-span-2 row-span-2 sm:col-span-4'
  if (index === 0) return 'col-span-2 row-span-2 sm:col-span-2'
  if (count === 2) return 'col-span-2 row-span-2 sm:col-span-2'
  return 'col-span-1 row-span-1'
}

export function FahrtFotoGalerie({ fahrtId, currentUserId }: Props) {
  const { bilder, loading, busy, error, addBild, removeBild } = useBerichtBilder(fahrtId)
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)

  const canUpload = Boolean(currentUserId)

  async function handleFiles(files: FileList | File[] | null) {
    if (!files || !currentUserId) return

    const selectedFiles = Array.from(files)
    if (selectedFiles.length === 0) return

    setUploading(true)
    let added = 0

    for (const file of selectedFiles) {
      if (await addBild(currentUserId, file)) added += 1
    }

    setUploading(false)

    if (added > 0) {
      toast.success(added === 1 ? 'Foto hinzugefügt' : `${added} Fotos hinzugefügt`)
    }
    if (added < selectedFiles.length) {
      toast.error(
        added === 0
          ? 'Fotos konnten nicht hochgeladen werden'
          : `${selectedFiles.length - added} Fotos konnten nicht hochgeladen werden`,
      )
    }
  }

  async function openGallery(index: number, trigger: HTMLButtonElement) {
    try {
      await openPhotoLightbox({
        slides: bilder.map((bild, photoIndex) => ({
          src: bild.url,
          title: `Foto ${photoIndex + 1} von ${bilder.length}`,
          description: `Hinzugefügt am ${createdAtFormatter.format(new Date(bild.created_at))}`,
          download: true,
        })),
        index,
        trigger,
      })
    } catch (loadError) {
      console.error('Fotogalerie konnte nicht geöffnet werden:', loadError)
      toast.error('Die Großansicht konnte nicht geöffnet werden')
    }
  }

  async function handleRemove(bild: BerichtBild) {
    if (!window.confirm('Dieses Foto wirklich entfernen?')) return
    const removed = await removeBild(bild.id, bild.path)
    if (removed) toast.success('Foto entfernt')
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragActive(false)
    void handleFiles(event.dataTransfer.files)
  }

  function handleDropzoneKeydown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    fileInputRef.current?.click()
  }

  return (
    <DashboardSection
      title="Fotos"
      badge={bilder.length > 0 ? `${bilder.length}` : undefined}
      className="overflow-hidden"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="max-w-xl text-sm leading-6 text-shell-fg/62">
              Bilder von der Fahrt, dem Stadion und allem, was vom Spieltag bleiben soll.
            </p>
            <p className="mt-1 text-xs text-shell-fg/38">JPG, PNG oder WebP · maximal 5 MB</p>
          </div>

          {canUpload ? (
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                disabled={busy || uploading}
                onClick={() => cameraInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-shell-fg/15 px-3 py-2 text-sm font-semibold text-shell-fg/75 transition hover:bg-shell-fg/10 hover:text-shell-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shell-cta-bg active:scale-[0.98] disabled:opacity-50"
              >
                <CameraIcon className="h-4 w-4" />
                Aufnehmen
              </button>
              <button
                type="button"
                disabled={busy || uploading}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg bg-shell-cta-bg px-3.5 py-2 text-sm font-semibold text-shell-cta-fg transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shell-fg focus-visible:ring-offset-2 focus-visible:ring-offset-shell-bg active:scale-[0.98] disabled:opacity-50"
              >
                {uploading ? 'Lädt …' : 'Fotos wählen'}
              </button>
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200" role="alert">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Fotos werden geladen">
            <div className="col-span-2 aspect-[4/3] animate-pulse rounded-2xl bg-shell-fg/8" />
            <div className="aspect-square animate-pulse rounded-xl bg-shell-fg/8" />
            <div className="aspect-square animate-pulse rounded-xl bg-shell-fg/8" />
          </div>
        ) : bilder.length > 0 ? (
          <div className="grid auto-rows-[7.5rem] grid-cols-2 gap-2 sm:auto-rows-[9rem] sm:grid-cols-4">
            {bilder.map((bild, index) => {
              const canDelete = currentUserId === bild.uploaded_by

              return (
                <div
                  key={bild.id}
                  className={`group relative min-h-0 overflow-hidden rounded-xl bg-shell-fg/8 ${photoClassName(index, bilder.length)}`}
                >
                  <button
                    type="button"
                    onClick={(event) => void openGallery(index, event.currentTarget)}
                    className="h-full w-full cursor-zoom-in overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-shell-cta-bg"
                    aria-label={`Foto ${index + 1} von ${bilder.length} öffnen`}
                  >
                    <img
                      src={bild.url}
                      alt={`Erinnerung von der Auswärtsfahrt, Foto ${index + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 ease-[var(--ease-out)] group-hover:scale-[1.025] group-hover:opacity-90"
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition group-hover:opacity-100" />
                  </button>

                  {canDelete ? (
                    <button
                      type="button"
                      disabled={busy || uploading}
                      onClick={() => void handleRemove(bild)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#07182b]/80 text-lg font-medium text-white shadow-lg opacity-100 transition hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 disabled:opacity-40"
                      aria-label={`Foto ${index + 1} entfernen`}
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              )
            })}

            {canUpload ? (
              <button
                type="button"
                disabled={busy || uploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-[7.5rem] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-shell-fg/20 text-shell-fg/42 transition hover:border-shell-cta-bg/60 hover:bg-shell-fg/5 hover:text-shell-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shell-cta-bg active:scale-[0.98] disabled:opacity-50 sm:min-h-[9rem]"
              >
                <CameraIcon />
                <span className="text-xs font-semibold">Mehr Fotos</span>
              </button>
            ) : null}
          </div>
        ) : canUpload ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={handleDropzoneKeydown}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className={`flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shell-cta-bg ${
              dragActive
                ? 'border-shell-cta-bg bg-shell-fg/10 text-shell-fg'
                : 'border-shell-fg/20 bg-shell-fg/[0.025] text-shell-fg/52 hover:border-shell-fg/35 hover:bg-shell-fg/5'
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-shell-fg/8 ring-1 ring-inset ring-shell-fg/12">
              <CameraIcon className="h-6 w-6" />
            </div>
            <p className="font-display mt-4 text-lg text-shell-fg">Der erste Blick zurück</p>
            <p className="mt-1 max-w-sm text-sm leading-5">
              Fotos hier ablegen oder auswählen. Sie erscheinen für alle Mitfahrer an dieser Fahrt.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-shell-fg/15 px-5 py-10 text-center">
            <p className="font-medium text-shell-fg/65">Noch keine Fotos zu dieser Fahrt</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(event) => {
            void handleFiles(event.target.files)
            event.target.value = ''
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            void handleFiles(event.target.files)
            event.target.value = ''
          }}
        />
      </div>
    </DashboardSection>
  )
}
