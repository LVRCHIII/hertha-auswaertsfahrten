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
      <form className="space-y-4" onSubmit={handleSubmit}>
        {(['email', 'password'] as const).map((field, i) => (
          <motion.div key={field} custom={i} variants={fieldVariants} initial="hidden" animate="visible">
            <label
              className="auth-label mb-2 block text-shell-fg/62"
              htmlFor={field}
            >
              {field === 'email' ? 'E-Mail' : 'Passwort'}
            </label>
            <input
              id={field}
              type={field}
              autoComplete={field === 'email' ? 'email' : 'current-password'}
              required
              value={field === 'email' ? email : password}
              onChange={(e) =>
                field === 'email' ? setEmail(e.target.value) : setPassword(e.target.value)
              }
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

        <motion.div
          custom={2}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
        >
          <button
            type="submit"
            disabled={submitting}
            className="auth-submit relative mt-1 w-full rounded-[0.9rem] bg-shell-cta-bg px-4 py-3 font-semibold text-shell-cta-fg shadow-lg shadow-black/20 transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Wird angemeldet …
              </span>
            ) : (
              'Anmelden'
            )}
          </button>
        </motion.div>
      </form>

      <motion.p
        className="mt-7 text-center text-sm text-shell-fg/55"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.4 }}
      >
        <Link className="font-semibold text-shell-fg underline-offset-4 hover:underline" to="/forgot-password">
          Passwort vergessen?
        </Link>
      </motion.p>

      <motion.p
        className="mt-3 text-center text-sm text-shell-fg/55"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        Noch keinen Account?{' '}
        <Link className="font-semibold text-shell-fg underline-offset-4 hover:underline" to="/register">
          Registrieren
        </Link>
      </motion.p>
    </AuthLayout>
  )
}
