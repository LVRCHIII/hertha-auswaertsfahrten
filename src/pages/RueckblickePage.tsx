import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { MatchupWappen } from '../components/MatchupWappen'
import { useToast } from '../contexts/ToastContext'
import { useFotoArchiv } from '../hooks/useFotoArchiv'
import { filterFotoArchivFahrten } from '../lib/fotoArchiv'
import type { FotoArchivFahrt } from '../lib/fotoArchivApi'
import { openPhotoLightbox } from '../lib/photoLightbox'

const spieltagFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const uploadFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ArchiveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-7 w-7">
      <rect x="3.5" y="5" width="17" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="m6.5 16 3.8-4 2.8 2.7 2.2-2.2 2.7 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16.5" cy="9" r="1.25" fill="currentColor" />
    </svg>
  )
}

function archivePhotoClassName(index: number, count: number): string {
  if (count === 1) return 'col-span-2 row-span-3 md:col-span-12 md:row-span-4'
  if (count === 2) return 'col-span-1 row-span-2 md:col-span-6 md:row-span-3'
  if (index === 0) return 'col-span-2 row-span-2 md:col-span-7 md:row-span-3'
  if (index === 1) return 'col-span-1 row-span-1 md:col-span-5 md:row-span-2'
  if (index === 2) return 'col-span-1 row-span-1 md:col-span-5 md:row-span-1'

  const remaining = count - 3
  const remainingIndex = index - 3

  if (remaining === 1 || (remaining % 3 === 1 && remainingIndex === remaining - 1)) {
    return 'col-span-2 row-span-2 md:col-span-12 md:row-span-2'
  }

  if (remaining === 2 || (remaining % 3 === 2 && remainingIndex >= remaining - 2)) {
    return 'col-span-1 row-span-1 md:col-span-6 md:row-span-2'
  }

  return 'col-span-1 row-span-1 md:col-span-4 md:row-span-2'
}

function ArchiveSkeleton() {
  return (
    <div className="space-y-14" aria-label="Rückblicke werden geladen">
      {[0, 1].map((section) => (
        <div key={section} className="animate-pulse">
          <div className="mb-5 h-7 w-52 rounded bg-shell-fg/10" />
          <div className="grid auto-rows-[7rem] grid-cols-2 gap-1 md:auto-rows-[9rem] md:grid-cols-12">
            <div className="col-span-2 row-span-2 rounded-l-xl bg-shell-fg/8 md:col-span-7 md:row-span-3" />
            <div className="row-span-2 rounded-r-xl bg-shell-fg/8 md:col-span-5 md:row-span-2" />
            <div className="bg-shell-fg/8 md:col-span-5" />
          </div>
        </div>
      ))}
    </div>
  )
}

type FahrtRueckblickProps = {
  fahrt: FotoArchivFahrt
}

function FahrtRueckblick({ fahrt }: FahrtRueckblickProps) {
  const toast = useToast()
  const gameDate = new Date(fahrt.spiel_at)

  async function openGallery(index: number, trigger: HTMLButtonElement) {
    try {
      await openPhotoLightbox({
        slides: fahrt.fotos.map((foto, photoIndex) => ({
          src: foto.url,
          title: `${fahrt.gegner} · Foto ${photoIndex + 1} von ${fahrt.fotos.length}`,
          description: `${spieltagFormatter.format(gameDate)} · ${fahrt.stadion} · hochgeladen am ${uploadFormatter.format(new Date(foto.created_at))}`,
          download: true,
        })),
        index,
        trigger,
      })
    } catch (error) {
      console.error('Rückblick konnte nicht geöffnet werden:', error)
      toast.error('Die Großansicht konnte nicht geöffnet werden')
    }
  }

  return (
    <article className="scroll-mt-36 border-t border-shell-fg/12 pt-6">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <MatchupWappen gegner={fahrt.gegner} istHeimspiel={fahrt.typ === 'heim'} />
          <div className="min-w-0">
            <h2 className="font-display text-2xl leading-none text-shell-fg sm:text-3xl">
              {fahrt.gegner}
            </h2>
            <p className="mt-2 text-sm text-shell-fg/68">
              {spieltagFormatter.format(gameDate)}
              <span className="mx-2 text-shell-fg/25">·</span>
              {fahrt.stadion}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:justify-end">
          <span className="text-sm font-medium text-shell-fg/48">
            {fahrt.fotos.length} {fahrt.fotos.length === 1 ? 'Foto' : 'Fotos'}
          </span>
          <Link
            to={`/fahrten/${fahrt.id}`}
            className="rounded-lg border border-shell-fg/15 px-3 py-1.5 text-sm font-semibold text-shell-fg/75 transition hover:bg-shell-fg/10 hover:text-shell-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shell-cta-bg active:scale-[0.98]"
          >
            Fahrt öffnen
          </Link>
        </div>
      </header>

      <div className="grid grid-flow-row-dense auto-rows-[7rem] grid-cols-2 gap-1 overflow-hidden rounded-xl bg-shell-fg/8 md:auto-rows-[9rem] md:grid-cols-12">
        {fahrt.fotos.map((foto, index) => (
          <button
            key={foto.id}
            type="button"
            onClick={(event) => void openGallery(index, event.currentTarget)}
            className={`group relative min-h-0 cursor-zoom-in overflow-hidden bg-shell-fg/8 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-shell-cta-bg ${archivePhotoClassName(index, fahrt.fotos.length)}`}
            aria-label={`${fahrt.gegner}, Foto ${index + 1} von ${fahrt.fotos.length} öffnen`}
          >
            <img
              src={foto.url}
              alt={`Auswärtsfahrt zu ${fahrt.gegner}, Foto ${index + 1}`}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 ease-[var(--ease-out)] group-hover:scale-[1.02] group-hover:brightness-90"
            />
            <span className="pointer-events-none absolute inset-0 bg-shell-bg/0 transition group-hover:bg-shell-bg/8" />
            <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/55 px-2 py-1 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
              {index + 1}/{fahrt.fotos.length}
            </span>
          </button>
        ))}
      </div>
    </article>
  )
}

export function RueckblickePage() {
  const { fahrten, loading, error, reload } = useFotoArchiv()
  const [query, setQuery] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const filteredFahrten = useMemo(
    () => filterFotoArchivFahrten(fahrten, { query, from, to }),
    [fahrten, query, from, to],
  )
  const photoCount = useMemo(
    () => fahrten.reduce((total, fahrt) => total + fahrt.fotos.length, 0),
    [fahrten],
  )
  const filtersActive = Boolean(query || from || to)

  function resetFilters() {
    setQuery('')
    setFrom('')
    setTo('')
  }

  return (
    <AppShell title="Rückblicke" wide>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="max-w-2xl text-base leading-7 text-shell-fg/68">
            Alle Fotos nach Spieltag sortiert, vom neuesten Auswärtsspiel bis zur ersten gemeinsamen Fahrt.
          </p>
        </div>
        {!loading && !error && fahrten.length > 0 ? (
          <p className="font-score shrink-0 text-lg text-shell-fg/52">
            {photoCount} Fotos · {fahrten.length} Fahrten
          </p>
        ) : null}
      </div>

      <section
        aria-label="Rückblicke filtern"
        className="glass-card sticky top-[4.35rem] z-20 mb-12 rounded-xl p-3"
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Nach Gegner, Stadion oder Datum suchen</span>
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-shell-fg/45">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Gegner, Stadion oder Datum"
              className="h-11 w-full rounded-lg border border-shell-fg/14 bg-shell-bg/40 pl-10 pr-3 text-sm text-shell-fg outline-none placeholder:text-shell-fg/48 transition focus:border-shell-cta-bg/60 focus:ring-2 focus:ring-shell-cta-bg/25"
            />
          </label>

          <div className="flex min-w-0 gap-2">
            <label className="min-w-0 flex-1 lg:w-40 lg:flex-none">
              <span className="sr-only">Spieltage ab Datum</span>
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(event) => setFrom(event.target.value)}
                className="archive-date-input h-11 w-full rounded-lg border border-shell-fg/14 bg-shell-bg/40 px-3 text-sm text-shell-fg outline-none transition focus:border-shell-cta-bg/60 focus:ring-2 focus:ring-shell-cta-bg/25"
                aria-label="Von Datum"
              />
            </label>
            <label className="min-w-0 flex-1 lg:w-40 lg:flex-none">
              <span className="sr-only">Spieltage bis Datum</span>
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(event) => setTo(event.target.value)}
                className="archive-date-input h-11 w-full rounded-lg border border-shell-fg/14 bg-shell-bg/40 px-3 text-sm text-shell-fg outline-none transition focus:border-shell-cta-bg/60 focus:ring-2 focus:ring-shell-cta-bg/25"
                aria-label="Bis Datum"
              />
            </label>
          </div>

          <div className="flex h-9 items-center justify-between gap-3 px-1 lg:h-11 lg:justify-end">
            <span className="whitespace-nowrap text-sm text-shell-fg/52" aria-live="polite">
              {filteredFahrten.length} {filteredFahrten.length === 1 ? 'Spieltag' : 'Spieltage'}
            </span>
            {filtersActive ? (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-shell-fg/72 transition hover:bg-shell-fg/10 hover:text-shell-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shell-cta-bg"
              >
                Zurücksetzen
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {loading ? <ArchiveSkeleton /> : null}

      {error ? (
        <div className="rounded-xl bg-red-500/15 px-5 py-4 text-red-100" role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void reload()}
            className="mt-3 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Erneut laden
          </button>
        </div>
      ) : null}

      {!loading && !error && fahrten.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-shell-fg/18 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-shell-fg/8 text-shell-fg/55">
            <ArchiveIcon />
          </div>
          <h2 className="font-display mt-5 text-xl text-shell-fg">Noch keine Rückblicke</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-shell-fg/58">
            Sobald Fotos zu einer Fahrt hochgeladen wurden, erscheinen sie hier automatisch nach Spieltag sortiert.
          </p>
          <Link
            to="/"
            className="mt-5 rounded-lg bg-shell-cta-bg px-4 py-2 text-sm font-semibold text-shell-cta-fg transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shell-fg"
          >
            Fahrten ansehen
          </Link>
        </div>
      ) : null}

      {!loading && !error && fahrten.length > 0 && filteredFahrten.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center border-y border-shell-fg/12 px-6 text-center">
          <h2 className="font-display text-xl text-shell-fg">Keine passenden Spieltage</h2>
          <p className="mt-2 text-sm text-shell-fg/58">Ändere den Suchbegriff oder den Datumsbereich.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 rounded-lg bg-shell-cta-bg px-4 py-2 text-sm font-semibold text-shell-cta-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shell-fg"
          >
            Filter zurücksetzen
          </button>
        </div>
      ) : null}

      {!loading && !error && filteredFahrten.length > 0 ? (
        <div className="space-y-16">
          {filteredFahrten.map((fahrt, index) => {
            const year = new Date(fahrt.spiel_at).getFullYear()
            const previousYear = index > 0 ? new Date(filteredFahrten[index - 1].spiel_at).getFullYear() : null

            return (
              <div key={fahrt.id}>
                {year !== previousYear ? (
                  <div className="mb-6 flex items-center gap-4" aria-label={`Jahr ${year}`}>
                    <span className="font-score text-2xl text-shell-fg/38">{year}</span>
                    <span className="h-px flex-1 bg-shell-fg/10" />
                  </div>
                ) : null}
                <FahrtRueckblick fahrt={fahrt} />
              </div>
            )
          })}
        </div>
      ) : null}
    </AppShell>
  )
}
