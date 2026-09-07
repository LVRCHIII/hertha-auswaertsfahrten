import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  fetchHerthaAuswaertsSpiele,
  fetchHerthaHeimSpiele,
  formatOpenLigaSeason,
  getCurrentOpenLigaSeason,
  type ImportableSpiel,
  type VorhandenesSpiel,
} from '../lib/openligaFixtures'
import { insertFahrt } from '../lib/fahrtenApi'
import { useToast } from '../contexts/ToastContext'
import type { FahrtTyp } from '../types/fahrt'

type Props = {
  typ: FahrtTyp
  vorhandeneSpiele: VorhandenesSpiel[]
  bestandWirdGeladen: boolean
  bestandFehler: string | null
  onBestandErneutLaden: () => void
  onImported: (allSuccessful: boolean) => Promise<void> | void
}

type Step = 'idle' | 'loading' | 'preview' | 'importing'

export function SpielplanImport({
  typ,
  vorhandeneSpiele,
  bestandWirdGeladen,
  bestandFehler,
  onBestandErneutLaden,
  onImported,
}: Props) {
  const { user } = useAuth()
  const toast = useToast()
  const [season] = useState(() => getCurrentOpenLigaSeason())
  const [step, setStep] = useState<Step>('idle')
  const [spiele, setSpiele] = useState<ImportableSpiel[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])

  async function handleLaden() {
    if (bestandWirdGeladen || bestandFehler) return

    setStep('loading')
    setError(null)
    setWarnings([])
    try {
      const fetchSpiele = typ === 'heim' ? fetchHerthaHeimSpiele : fetchHerthaAuswaertsSpiele
      const result = await fetchSpiele(vorhandeneSpiele, season)
      setSpiele(result.spiele)
      setWarnings(result.warnings)
      const neuSet = new Set(
        result.spiele.filter((spiel) => !spiel.exists).map((spiel) => spiel.openliga_match_id),
      )
      setSelected(neuSet)
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      setStep('idle')
    }
  }

  function toggleSelected(matchId: number) {
    if (step === 'importing') return

    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(matchId)) next.delete(matchId)
      else next.add(matchId)
      return next
    })
  }

  function handleClosePreview() {
    if (step === 'importing') return
    setStep('idle')
    setSpiele([])
    setSelected(new Set())
    setWarnings([])
    setError(null)
  }

  async function handleImport() {
    if (!user) return
    setStep('importing')

    const zuImportieren = spiele.filter((spiel) => selected.has(spiel.openliga_match_id))
    let fehler = 0
    const fehlgeschlageneIds = new Set<number>()
    const erfolgreicheIds = new Set<number>()
    const fehlerMeldungen = new Set<string>()

    setError(null)

    for (const spiel of zuImportieren) {
      const result = await insertFahrt({
        openliga_match_id: spiel.openliga_match_id,
        gegner: spiel.gegner,
        stadion: spiel.stadion,
        spiel_at: spiel.spiel_at,
        typ,
        startpunkt: 'Berlin',
        notizen: null,
        treffpunkt_berlin: null,
        created_by: user.id,
      })
      if (result.error) {
        fehler++
        fehlgeschlageneIds.add(spiel.openliga_match_id)
        fehlerMeldungen.add(result.error)
      } else {
        erfolgreicheIds.add(spiel.openliga_match_id)
      }
    }

    const erfolgreich = zuImportieren.length - fehler
    if (erfolgreich > 0) {
      toast.success(`${erfolgreich} ${erfolgreich === 1 ? 'Spiel' : 'Spiele'} importiert`)
      await onImported(fehler === 0)
    }
    if (fehler > 0) {
      toast.error(`${fehler} ${fehler === 1 ? 'Spiel' : 'Spiele'} konnten nicht importiert werden`)
      setError([...fehlerMeldungen].join(' '))
      setSpiele((prev) => prev.map((spiel) =>
        erfolgreicheIds.has(spiel.openliga_match_id)
          ? { ...spiel, exists: true }
          : spiel,
      ))
      setSelected(fehlgeschlageneIds)
      setStep('preview')
      return
    }

    setStep('idle')
    setSpiele([])
    setSelected(new Set())
    setWarnings([])
  }

  const neuCount = selected.size

  if (step === 'idle' || step === 'loading') {
    return (
      <div className="rounded-2xl bg-shell-fg/8 p-4 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-shell-fg/90">Spielplan importieren</p>
            <p className="mt-0.5 text-xs text-shell-fg/55">
              {bestandWirdGeladen
                ? 'Vorhandene Fahrten werden geprüft …'
                : bestandFehler
                  ? 'Vorhandene Fahrten konnten nicht geprüft werden.'
                  : `Hertha-${typ === 'heim' ? 'Heimspiele' : 'Auswärtsspiele'} ohne zusätzlichen API-Key laden`}
            </p>
            <a
              href="https://www.openligadb.de/"
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-[10px] text-shell-fg/40 underline-offset-2 hover:text-shell-fg/65 hover:underline"
            >
              Daten: OpenLigaDB
            </a>
          </div>
          <button
            type="button"
            onClick={handleLaden}
            disabled={step === 'loading' || bestandWirdGeladen || Boolean(bestandFehler)}
            className="shrink-0 rounded-lg bg-shell-cta-bg px-3 py-2 text-sm font-semibold text-shell-cta-fg transition hover:opacity-90 disabled:opacity-60"
          >
            {step === 'loading' ? (
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
                Laden…
              </span>
            ) : (
              '📅 Laden'
            )}
          </button>
        </div>
        {error ? (
          <p className="mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-200">{error}</p>
        ) : null}
        {bestandFehler ? (
          <div className="mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-200" role="alert">
            <p>{bestandFehler}</p>
            <button
              type="button"
              onClick={onBestandErneutLaden}
              className="mt-1 font-semibold underline underline-offset-2"
            >
              Erneut prüfen
            </button>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-shell-cta-bg/30 bg-shell-fg/8 shadow-sm">
      <div className="flex items-center justify-between border-b border-shell-fg/10 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-shell-fg/90">
            Spielplan {formatOpenLigaSeason(season)}
          </p>
          <p className="text-xs text-shell-fg/55">
            {spiele.filter((s) => !s.exists).length} neue · {spiele.filter((s) => s.exists).length} bereits vorhanden
          </p>
        </div>
        <button
          type="button"
          onClick={handleClosePreview}
          disabled={step === 'importing'}
          className="text-xs text-shell-fg/45 hover:text-shell-fg/70 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Schließen
        </button>
      </div>

      {warnings.map((warning) => (
        <p
          key={warning}
          className="mx-4 mt-3 rounded-lg bg-amber-500/15 px-3 py-2 text-xs text-amber-100"
          role="status"
        >
          {warning}
        </p>
      ))}

      {error ? (
        <p className="mx-4 mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-200" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="max-h-72 divide-y divide-shell-fg/10 overflow-y-auto">
        {spiele.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-shell-fg/55">
            Für {formatOpenLigaSeason(season)} wurden keine Hertha-{typ === 'heim' ? 'Heimspiele' : 'Auswärtsspiele'} gefunden.
          </li>
        ) : null}
        {spiele.map((spiel) => {
          const datum = new Date(spiel.spiel_at)
          const isSelected = selected.has(spiel.openliga_match_id)

          return (
            <li key={spiel.openliga_match_id}>
              <label
                className={`flex items-center gap-3 px-4 py-3 transition ${
                  spiel.exists || step === 'importing'
                    ? 'cursor-not-allowed opacity-40'
                    : 'cursor-pointer hover:bg-shell-fg/10'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={spiel.exists || step === 'importing'}
                  onChange={() => toggleSelected(spiel.openliga_match_id)}
                  className="h-4 w-4 rounded accent-card-accent"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="font-medium text-shell-fg text-sm">{spiel.gegner}</span>
                    <span className="text-[10px] font-medium text-shell-fg/45 uppercase tracking-wide">{spiel.liga}</span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-shell-fg/55">
                    <span>
                      {datum.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit' })}
                      {', '}
                      {datum.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                    </span>
                    {spiel.stadion ? <span>· {spiel.stadion}</span> : null}
                  </span>
                </span>
                {spiel.exists ? (
                  <span className="shrink-0 text-xs text-shell-fg/45">✓ vorhanden</span>
                ) : null}
              </label>
            </li>
          )
        })}
      </ul>

      <div className="flex items-center justify-between border-t border-shell-fg/10 px-4 py-3">
        <p className="text-xs text-shell-fg/55">{neuCount} ausgewählt</p>
        <button
          type="button"
          onClick={handleImport}
          disabled={neuCount === 0 || step === 'importing'}
          className="rounded-lg bg-shell-cta-bg px-4 py-2 text-sm font-semibold text-shell-cta-fg transition hover:opacity-90 disabled:opacity-60"
        >
          {step === 'importing' ? 'Importiere…' : `${neuCount} Spiel${neuCount !== 1 ? 'e' : ''} importieren`}
        </button>
      </div>
    </div>
  )
}
