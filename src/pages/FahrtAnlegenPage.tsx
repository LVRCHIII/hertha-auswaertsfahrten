import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../contexts/AuthContext'
import { combineDateAndTime } from '../lib/fahrtFormat'
import { insertFahrt } from '../lib/fahrtenApi'

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-hertha-mid focus:ring-2 focus:ring-hertha-mid/30'

export function FahrtAnlegenPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [gegner, setGegner] = useState('')
  const [stadion, setStadion] = useState('')
  const [datum, setDatum] = useState('')
  const [anpfiff, setAnpfiff] = useState('')
  const [startpunkt, setStartpunkt] = useState('Berlin')
  const [treffpunktBerlin, setTreffpunktBerlin] = useState('')
  const [notizen, setNotizen] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    setError(null)
    setSubmitting(true)

    const result = await insertFahrt({
      gegner: gegner.trim(),
      stadion: stadion.trim(),
      spiel_at: combineDateAndTime(datum, anpfiff),
      startpunkt: startpunkt.trim() || 'Berlin',
      notizen: notizen.trim() || null,
      treffpunkt_berlin: treffpunktBerlin.trim() || null,
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
    <AppShell title="Fahrt anlegen">
      <form
        className="space-y-5 rounded-2xl bg-white p-6 text-slate-900 shadow-lg"
        onSubmit={handleSubmit}
      >
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="gegner">
            Gegner <span className="text-red-500">*</span>
          </label>
          <input
            id="gegner"
            required
            placeholder="z. B. FC Bayern München"
            value={gegner}
            onChange={(e) => setGegner(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="stadion">
            Stadion / Zielort <span className="text-red-500">*</span>
          </label>
          <input
            id="stadion"
            required
            placeholder="z. B. Allianz Arena, München"
            value={stadion}
            onChange={(e) => setStadion(e.target.value)}
            className={inputClass}
          />
        </div>

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
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="anpfiff">
              Anpfiff <span className="text-red-500">*</span>
            </label>
            <input
              id="anpfiff"
              type="time"
              required
              value={anpfiff}
              onChange={(e) => setAnpfiff(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

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
            Treffpunkt in Berlin (optional)
          </label>
          <input
            id="treffpunkt"
            placeholder="z. B. Olympiastadion Nordkurve"
            value={treffpunktBerlin}
            onChange={(e) => setTreffpunktBerlin(e.target.value)}
            className={inputClass}
          />
        </div>

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
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-hertha-blue px-4 py-2.5 font-semibold text-white transition hover:bg-hertha-mid disabled:opacity-60"
          >
            {submitting ? 'Speichern …' : 'Fahrt speichern'}
          </button>
          <Link
            to="/"
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-center font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Abbrechen
          </Link>
        </div>
      </form>
    </AppShell>
  )
}
