import { useState } from 'react'
import { useFahrten } from '../hooks/useFahrten'
import { useToast } from '../contexts/ToastContext'
import { exportSaison, archiviereSaison, getAvailableSaisons } from '../lib/saisonExport'

export function SaisonExport() {
  const { fahrten, loading } = useFahrten()
  const toast = useToast()
  const [selectedSaison, setSelectedSaison] = useState('')
  const [exporting, setExporting] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [progress, setProgress] = useState('')
  const [confirmArchive, setConfirmArchive] = useState(false)

  const saisons = getAvailableSaisons(fahrten)

  if (loading) {
    return (
      <div className="rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-card-border)] p-4">
        <p className="text-sm text-[var(--color-shell-fg)] opacity-60">Saisons laden…</p>
      </div>
    )
  }

  if (!saisons.length) {
    return (
      <div className="rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-card-border)] p-4">
        <p className="text-sm text-[var(--color-shell-fg)] opacity-60">Noch keine Fahrten vorhanden.</p>
      </div>
    )
  }

  const activeSaison = selectedSaison || saisons[0]

  async function handleExport() {
    setExporting(true)
    setProgress('')
    const { blob, error } = await exportSaison(activeSaison, fahrten, setProgress)
    setExporting(false)
    setProgress('')

    if (error || !blob) {
      toast.error(error ?? 'Export fehlgeschlagen.')
      return
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Hertha_Auswaertsfahrten_${activeSaison.replace('/', '-')}.docx`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Saison ${activeSaison} exportiert!`)
  }

  async function handleArchive() {
    if (!confirmArchive) {
      setConfirmArchive(true)
      return
    }
    setArchiving(true)
    setProgress('')
    const { error } = await archiviereSaison(activeSaison, fahrten, setProgress)
    setArchiving(false)
    setProgress('')
    setConfirmArchive(false)

    if (error) {
      toast.error(error)
    } else {
      toast.success(`Saison ${activeSaison} archiviert — Bilder gelöscht, Texte bleiben erhalten.`)
    }
  }

  return (
    <div className="rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-card-border)] p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-[var(--color-shell-fg)] mb-1">Saisonexport</h3>
        <p className="text-xs text-[var(--color-shell-fg)] opacity-60">
          Spieltagsberichte als Word-Dokument exportieren — inkl. Bilder, Ergebnisse und Bewertungen.
        </p>
      </div>

      {/* Saisonauswahl */}
      <div>
        <label className="block text-xs font-medium text-[var(--color-shell-fg)] opacity-70 mb-1">
          Saison
        </label>
        <select
          value={activeSaison}
          onChange={(e) => {
            setSelectedSaison(e.target.value)
            setConfirmArchive(false)
          }}
          className="w-full rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card-bg)] text-[var(--color-shell-fg)] px-3 py-2 text-sm"
        >
          {saisons.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Fortschrittsanzeige */}
      {progress && (
        <p className="text-xs text-[var(--color-shell-fg)] opacity-60 animate-pulse">{progress}</p>
      )}

      {/* Export-Button */}
      <button
        onClick={handleExport}
        disabled={exporting || archiving}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--color-shell-cta-bg)] text-[var(--color-shell-cta-fg)] px-4 py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {exporting ? (
          <>
            <span className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            {progress || 'Exportieren…'}
          </>
        ) : (
          <>📄 Als .docx exportieren</>
        )}
      </button>

      {/* Archivierung */}
      <div className="border-t border-[var(--color-card-border)] pt-3 space-y-2">
        <p className="text-xs text-[var(--color-shell-fg)] opacity-50">
          Archivierung: Bilder aus dem Storage löschen — Texte und Bewertungen bleiben erhalten.
          Vorher exportieren empfohlen.
        </p>

        {confirmArchive ? (
          <div className="flex gap-2">
            <button
              onClick={handleArchive}
              disabled={archiving}
              className="flex-1 rounded-lg bg-red-600 text-white px-3 py-2 text-xs font-medium disabled:opacity-50"
            >
              {archiving ? 'Archivieren…' : `⚠️ Ja, Bilder für ${activeSaison} löschen`}
            </button>
            <button
              onClick={() => setConfirmArchive(false)}
              className="rounded-lg border border-[var(--color-card-border)] text-[var(--color-shell-fg)] px-3 py-2 text-xs"
            >
              Abbrechen
            </button>
          </div>
        ) : (
          <button
            onClick={handleArchive}
            disabled={exporting || archiving}
            className="w-full rounded-lg border border-[var(--color-card-border)] text-[var(--color-shell-fg)] px-3 py-2 text-xs disabled:opacity-50"
          >
            🗂 Saison archivieren (Bilder löschen)
          </button>
        )}
      </div>
    </div>
  )
}
