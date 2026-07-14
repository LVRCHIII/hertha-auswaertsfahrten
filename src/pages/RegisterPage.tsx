import { motion } from 'framer-motion'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../contexts/AuthContext'

const fieldVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.25 + i * 0.08, duration: 0.35, ease: 'easeOut' as const },
  }),
}

const FIELDS = [
  { id: 'email', label: 'E-Mail', type: 'email', autoComplete: 'email' },
  { id: 'password', label: 'Passwort', type: 'password', autoComplete: 'new-password' },
  { id: 'confirmPassword', label: 'Passwort bestätigen', type: 'password', autoComplete: 'new-password' },
] as const

export function RegisterPage() {
  const { user, signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  const values = { email, password, confirmPassword }
  const setters = {
    email: setEmail,
    password: setPassword,
    confirmPassword: setConfirmPassword,
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.')
      return
    }

    if (password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.')
      return
    }

    setSubmitting(true)
    const result = await signUp(email.trim(), password)
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    navigate('/login', { replace: true })
  }

  return (
    <AuthLayout
      title="Registrieren"
      subtitle="Erstelle ein Konto für den Auswärtsfahrten-Planer."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {FIELDS.map((field, i) => (
          <motion.div key={field.id} custom={i} variants={fieldVariants} initial="hidden" animate="visible">
            <label className="auth-label mb-2 block text-shell-fg/62" htmlFor={field.id}>
              {field.label}
            </label>
            <input
              id={field.id}
              type={field.type}
              autoComplete={field.autoComplete}
              required
              value={values[field.id]}
              onChange={(e) => setters[field.id](e.target.value)}
              className="auth-input w-full rounded-[0.9rem] border border-shell-fg/15 bg-shell-fg/[0.055] px-4 py-3 text-shell-fg outline-none"
            />
          </motion.div>
        ))}

        {error ? (
          <motion.p
            className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200"
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {error}
          </motion.p>
        ) : null}

        <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
          <button
            type="submit"
            disabled={submitting}
            className="auth-submit relative mt-1 w-full rounded-[0.9rem] bg-shell-cta-bg px-4 py-3 font-semibold text-shell-cta-fg shadow-lg shadow-black/20 transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Wird registriert …
              </span>
            ) : (
              'Konto erstellen'
            )}
          </button>
        </motion.div>
      </form>

      <motion.p
        className="mt-7 text-center text-sm text-shell-fg/55"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        Bereits registriert?{' '}
        <Link className="font-semibold text-shell-fg underline-offset-4 hover:underline" to="/login">
          Anmelden
        </Link>
      </motion.p>
    </AuthLayout>
  )
}
