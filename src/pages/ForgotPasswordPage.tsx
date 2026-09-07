import { motion } from 'framer-motion'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
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

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const result = await requestPasswordReset(email.trim())
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout
        title="E-Mail unterwegs"
        subtitle="Wenn ein Konto mit dieser Adresse existiert, ist gerade ein Link zum Zurücksetzen unterwegs. Schau auch im Spam-Ordner nach."
      >
        <Link
          className="auth-submit block w-full rounded-[0.9rem] bg-shell-cta-bg px-4 py-3 text-center font-semibold text-shell-cta-fg shadow-lg shadow-black/20 transition hover:opacity-90 active:scale-[0.98]"
          to="/login"
        >
          Zurück zum Login
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Passwort vergessen"
      subtitle="Gib deine E-Mail-Adresse ein, wir schicken dir einen Link zum Zurücksetzen."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
          <label className="auth-label mb-2 block text-shell-fg/62" htmlFor="email">
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input w-full rounded-[0.9rem] border border-shell-fg/15 bg-shell-fg/[0.055] px-4 py-3 text-shell-fg outline-none"
          />
        </motion.div>

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

        <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
          <button
            type="submit"
            disabled={submitting}
            className="auth-submit relative mt-1 w-full rounded-[0.9rem] bg-shell-cta-bg px-4 py-3 font-semibold text-shell-cta-fg shadow-lg shadow-black/20 transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Wird gesendet …' : 'Link zum Zurücksetzen senden'}
          </button>
        </motion.div>
      </form>

      <motion.p
        className="mt-7 text-center text-sm text-shell-fg/55"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Link className="font-semibold text-shell-fg underline-offset-4 hover:underline" to="/login">
          Zurück zum Login
        </Link>
      </motion.p>
    </AuthLayout>
  )
}
