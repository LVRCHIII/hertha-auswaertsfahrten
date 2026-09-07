import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnpfiffPicker } from '../components/AnpfiffPicker'
import { AppShell } from '../components/AppShell'
import { SpielplanImport } from '../components/SpielplanImport'
import { VereinAutocomplete } from '../components/VereinAutocomplete'
import { useAuth } from '../contexts/AuthContext'
import { HERTHA_STADION, type Verein } from '../data/vereine'
import { combineDateAndTime } from '../lib/fahrtFormat'
import { HERTHA_TREFFPUNKT, isDefaultTreffpunkt } from '../lib/defaultTreffpunkt'
import { insertFahrt } from '../lib/fahrtenApi'
import { useFahrten } from '../hooks/useFahrten'
import type { FahrtTyp } from '../types/fahrt'

const inputClass =
  'w-full rounded-lg border border-shell-fg/20 bg-shell-fg/8 px-3 py-2 text-shell-fg outline-none focus:border-shell-cta-bg focus:ring-2 focus:ring-shell-cta-bg/40'

export function FahrtAnlegenPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { fahrten, loading: fahrtenLoading, error: fahrtenError, refetch } = useFahrten()
  const vorhandeneSpiele = fahrten.map((fahrt) => ({
    gegner: fahrt.gegner,
    spiel_at: fahrt.spiel_at,
    openliga_match_id: fahrt.openliga_match_id,
  }))

  const [typ, setTyp] = useState<FahrtTyp>('auswaerts')
  const [gegner, setGegner] = useState('')
  const [stadion, setStadion] = useState('')
  const [datum, setDatum] = useState('')
  const [anpfiff, setAnpfiff] = useState('')
  const [startpunkt, setStartpunkt] = useState('Berlin')
  const [treffpunktBerlin, setTreffpunktBerlin] = useState<string>(HERTHA_TREFFPUNKT.label)
  const [notizen, setNotizen] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const istHeimspiel = typ === 'heim'

  function handleTypChange(nextTyp: FahrtTyp) {
    setTyp(nextTyp)
    setStadion(nextTyp === 'heim' ? HERTHA_STADION : '')
  }

  function handleVereinSelect(verein: Verein | null) {
    if (verein && typ === 'auswaerts') setStadion(verein.stadion)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    if (!anpfiff.trim()) {
      setError('Bitte eine Anpfiffzeit wählen oder eingeben.')
      return
    }

    setError(null)
    setSubmitting(true)

    const result = await insertFahrt({
      gegner: gegner.trim(),
      stadion: (istHeimspiel ? HERTHA_STADION : stadion).trim(),
      spiel_at: combineDateAndTime(datum, anpfiff),
      typ,
      startpunkt: startpunkt.trim() || 'Berlin',
      notizen: notizen.trim() || null,
      treffpunkt_berlin: isDefaultTreffpunkt(treffpunktBerlin) ? null : treffpunktBerlin.trim(),
      created_by: user.id,
    })

    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <AppShell title={istHeimspiel ? 'Heimspiel anlegen' : 'Fahrt anlegen'}>
      <div className="glass-card mb-4 inline-flex rounded-xl p-1 gap-0.5">
        {(
          [
            { id: 'auswaerts', label: 'Auswärtsspiel' },
            { id: 'heim', label: 'Heimspiel' },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleTypChange(option.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 active:scale-[0.97] ${
              typ === option.id
                ? 'bg-shell-cta-bg text-shell-cta-fg shadow-sm'
                : 'text-shell-fg/60 hover:bg-shell-fg/10 hover:text-shell-fg'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <SpielplanImport
          typ={typ}
          vorhandeneSpiele={vorhandeneSpiele}
          bestandWirdGeladen={fahrtenLoading}
          bestandFehler={fahrtenError}
          onBestandErneutLaden={() => { void refetch() }}
          onImported={async (allSuccessful) => {
            await refetch()
            if (allSuccessful) navigate('/')
          }}
        />
      </div>

      <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-shell-fg/45">
        oder manuell anlegen
      </p>

      <form
        className="space-y-5 rounded-2xl bg-shell-fg/8 p-6 text-shell-fg shadow-lg"
        onSubmit={handleSubmit}
      >
        <VereinAutocomplete
          value={gegner}
          onChange={setGegner}
          onVereinSelect={handleVereinSelect}
          required
        />

        {istHeimspiel ? (
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="stadion">
              Stadion
            </label>
            <input
              id="stadion"
              disabled
              value={HERTHA_STADION}
              className={`${inputClass} cursor-not-allowed opacity-70`}
            />
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="stadion">
              Stadion / Zielort <span className="text-red-500">*</span>
            </label>
            <input
              id="stadion"
              required
              placeholder="z. B. VELTINS-Arena, Gelsenkirchen"
              value={stadion}
              onChange={(e) => setStadion(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-shell-fg/55">
              Wird beim Vereins-Picker automatisch befüllt — lässt sich jederzeit anpassen.
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="datum">
              Datum <span className="text-red-500">*</span>
            </label>
            <input
              id="datum"
              type="date"
              required
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              className={inputClass}
            />
          </div>
          <AnpfiffPicker value={anpfiff} onChange={setAnpfiff} required />
        </div>

        {istHeimspiel ? null : (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="startpunkt">
                Startpunkt <span className="text-red-500">*</span>
              </label>
              <input
                id="startpunkt"
                required
                value={startpunkt}
                onChange={(e) => setStartpunkt(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="treffpunkt">
                Treffpunkt (optional)
              </label>
              <input
                id="treffpunkt"
                placeholder={HERTHA_TREFFPUNKT.label}
                value={treffpunktBerlin}
                onChange={(e) => setTreffpunktBerlin(e.target.value)}
                className={inputClass}
              />
            </div>
          </>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="notizen">
            Notizen (optional)
          </label>
          <textarea
            id="notizen"
            rows={3}
            value={notizen}
            onChange={(e) => setNotizen(e.target.value)}
            className={inputClass}
          />
        </div>

        {error ? (
          <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-shell-cta-bg px-4 py-2.5 font-semibold text-shell-cta-fg transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Speichern …' : 'Fahrt speichern'}
          </button>
          <Link
            to="/"
            className="rounded-lg border border-shell-fg/20 px-4 py-2.5 text-center font-medium text-shell-fg/80 transition hover:bg-shell-fg/10"
          >
            Abbrechen
          </Link>
        </div>
      </form>
    </AppShell>
  )
}
