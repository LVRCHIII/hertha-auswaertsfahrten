import { useState } from 'react'
import type { FormEvent } from 'react'
import { VereinAutocomplete } from './VereinAutocomplete'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { insertFutbologySpielManuell } from '../lib/futbologyApi'
import type { Verein } from '../data/vereine'

type Props = {
  onAdded: () => void
}

const inputClass =
  'w-full rounded-lg border border-shell-fg/20 bg-shell-fg/8 px-3 py-2 text-shell-fg text-sm outline-none focus:border-shell-cta-bg focus:ring-2 focus:ring-shell-cta-bg/40'

export function SpielHinzufuegenForm({ onAdded }: Props) {
  const { user } = useAuth()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [heimTeam, setHeimTeam] = useState('')
  const [heimStadion, setHeimStadion] = useState('')
  const [heimLiga, setHeimLiga] = useState('')
  const [gastTeam, setGastTeam] = useState('')
  const [datum, setDatum] = useState(new Date().toISOString().split('T')[0])
  const [ergebnis, setErgebnis] = useState('')

  function handleHeimSelect(verein: Verein | null) {
    if (verein) {
      setHeimStadion(verein.stadion)
      setHeimLiga(verein.liga)
    }
  }

  function handleGastSelect(_verein: Verein | null) {
    // Gast-Wahl füllt kein Stadion — Stadion kommt vom Heim-Team
  }

  function reset() {
    setHeimTeam('')
    setHeimStadion('')
    setHeimLiga('')
    setGastTeam('')
    setDatum(new Date().toISOString().split('T')[0])
    setErgebnis('')
    setOpen(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!heimTeam.trim() || !gastTeam.trim()) {
      toast.error('Bitte beide Teams angeben.')
      return
    }

    setSaving(true)
    const { error } = await insertFutbologySpielManuell(user.id, {
      datum,
      heim_team: heimTeam.trim(),
      gast_team: gastTeam.trim(),
      stadion: heimStadion.trim(),
      ergebnis: ergebnis.trim() || null,
      liga: heimLiga || null,
    })
    setSaving(false)

    if (error) {
      toast.error(error)
    } else {
      toast.success('Spiel hinzugefügt!')
      reset()
      onAdded()
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/30 py-3 text-sm font-medium text-shell-fg/70 hover:border-white/50 hover:text-shell-fg transition"
      >
        + Spiel manuell hinzufügen
      </button>
    )
  }

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-shell-fg">Spiel hinzufügen</h3>
        <button
          type="button"
          onClick={reset}
          className="text-shell-fg/45 hover:text-shell-fg/70 text-lg leading-none"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <VereinAutocomplete
            value={heimTeam}
            onChange={setHeimTeam}
            onVereinSelect={handleHeimSelect}
            label="Heimteam"
            inputId="heim_team"
            required
          />
          <VereinAutocomplete
            value={gastTeam}
            onChange={setGastTeam}
            onVereinSelect={handleGastSelect}
            label="Gastteam"
            inputId="gast_team"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-shell-fg/80" htmlFor="spiel_datum">
              Datum <span className="text-red-500">*</span>
            </label>
            <input
              id="spiel_datum"
              type="date"
              required
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-shell-fg/80" htmlFor="spiel_ergebnis">
              Ergebnis
            </label>
            <input
              id="spiel_ergebnis"
              type="text"
              placeholder="z. B. 2:1"
              value={ergebnis}
              onChange={(e) => setErgebnis(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-shell-fg/80" htmlFor="spiel_stadion">
            Stadion
          </label>
          <input
            id="spiel_stadion"
            type="text"
            placeholder="Wird automatisch aus Heimteam übernommen"
            value={heimStadion}
            onChange={(e) => setHeimStadion(e.target.value)}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-shell-cta-bg py-2 text-sm font-semibold text-shell-cta-fg disabled:opacity-50"
        >
          {saving ? 'Speichern…' : 'Spiel speichern'}
        </button>
      </form>
    </div>
  )
}
