import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchHerthaAuswaertsSpiele, type ImportableSpiel } from '../lib/apiFootballFixtures'
import { insertFahrt } from '../lib/fahrtenApi'
import { useToast } from '../contexts/ToastContext'

type Props = {
  vorhandeneSpielDaten: string[]
  onImported: () => void
}

type Step = 'idle' | 'loading' | 'preview' | 'importing'

export function SpielplanImport({ vorhandeneSpielDaten, onImported }: Props) {
  const { user } = useAuth()
  const toast = useToast()
  const [step, setStep] = useState<Step>('idle')
  const [spiele, setSpiele] = useState<ImportableSpiel[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  async function handleLaden() {
    setStep('loading')
    setError(null)
    try {
      const result = await fetchHerthaAuswaertsSpiele(vorhandeneSpielDaten)
      setSpiele(result)
      const neuSet = new Set(
        result.filter((s) => !s.exists).map((s) => s.spiel_at),
      )
      setSelected(neuSet)
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      setStep('idle')
    }
  }

  function toggleSelected(spielAt: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(spielAt)) next.delete(spielAt)
      else next.add(spielAt)
      return next
    })
  }

  async function handleImport() {
    if (!user) return
    setStep('importing')

    const zuImportieren = spiele.filter((s) => selected.has(s.spiel_at))
    let fehler = 0

    for (const spiel of zuImportieren) {
      const result = await insertFahrt({
        gegner: spiel.gegner,
        stadion: spiel.stadion,
        spiel_at: spiel.spiel_at,
        startpunkt: 'Berlin',
        notizen: null,
        treffpunkt_berlin: null,
        created_by: user.id,
      })
      if (result.error) fehler++
    }

    const erfolgreich = zuImportieren.length - fehler
    if (erfolgreich > 0) {
      toast.success(`${erfolgreich} ${erfolgreich === 1 ? 'Spiel' : 'Spiele'} importiert`)
      onImported()
    }
    if (fehler > 0) {
      toast.error(`${fehler} ${fehler === 1 ? 'Spiel' : 'Spiele'} konnten nicht importiert werden`)
    }

    setStep('idle')
    setSpiele([])
    setSelected(new Set())
  }

  const neuCount = selected.size

  if (step === 'idle' || step === 'loading') {
    return (
      <div className="rounded-2xl bg-shell-fg/8 p-4 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-shell-fg/90">Spielplan importieren</p>
            <p className="mt-0.5 text-xs text-shell-fg/55">
              Hertha-Auswärtsspiele automatisch aus der Datenbank laden
            </p>
          </div>
          <button
            type="button"
            onClick={handleLaden}
            disabled={step === 'loading'}
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
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-shell-cta-bg/30 bg-shell-fg/8 shadow-sm">
      <div className="flex items-center justify-between border-b border-shell-fg/10 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-shell-fg/90">Spielplan 2024/25</p>
          <p className="text-xs text-shell-fg/55">
            {spiele.filter((s) => !s.exists).length} neue · {spiele.filter((s) => s.exists).length} bereits vorhanden
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStep('idle')}
          className="text-xs text-shell-fg/45 hover:text-shell-fg/70"
        >
          Schließen
        </button>
      </div>

      <ul className="max-h-72 divide-y divide-shell-fg/10 overflow-y-auto">
        {spiele.map((spiel) => {
          const datum = new Date(spiel.spiel_at)
          const isSelected = selected.has(spiel.spiel_at)

          return (
            <li key={spiel.spiel_at}>
              <label
                className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-shell-fg/10 ${
                  spiel.exists ? 'opacity-40' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={spiel.exists}
                  onChange={() => toggleSelected(spiel.spiel_at)}
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
