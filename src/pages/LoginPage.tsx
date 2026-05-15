import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const result = await signIn(email.trim(), password)
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <AuthLayout
      title="Anmelden"
      subtitle="Melde dich an, um Auswärtsfahrten zu planen."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-hertha-mid focus:ring-2 focus:ring-hertha-mid/30"
          />
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor="password"
          >
            Passwort
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-hertha-mid focus:ring-2 focus:ring-hertha-mid/30"
          />
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-hertha-blue px-4 py-2.5 font-semibold text-white transition hover:bg-hertha-mid disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Wird angemeldet …' : 'Anmelden'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Noch kein Konto?{' '}
        <Link className="font-semibold text-hertha-mid hover:underline" to="/register">
          Registrieren
        </Link>
      </p>
    </AuthLayout>
  )
}
