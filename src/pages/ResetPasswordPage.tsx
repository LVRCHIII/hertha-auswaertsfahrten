import { motion } from 'framer-motion'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
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

// Wird sowohl nach "Passwort vergessen" als auch beim ersten Einladungslink aufgerufen —
// Supabase stellt in beiden Fällen über den Link automatisch eine Session her.
export function ResetPasswordPage() {
  const { user, loading, updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-shell-bg text-shell-fg">
        <p className="text-lg">Laden …</p>
      </div>
    )
  }

  if (done) {
    return <Navigate to="/" replace />
  }

  if (!user) {
    return (
      <AuthLayout
        title="Link ungültig"
        subtitle="Dieser Link ist abgelaufen oder wurde bereits verwendet. Fordere einen neuen an."
      >
        <Link
          className="auth-submit block w-full rounded-[0.9rem] bg-shell-cta-bg px-4 py-3 text-center font-semibold text-shell-cta-fg shadow-lg shadow-black/20 transition hover:opacity-90 active:scale-[0.98]"
          to="/forgot-password"
        >
          Neuen Link anfordern
        </Link>
      </AuthLayout>
    )
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
    const result = await updatePassword(password)
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setDone(true)
  }

  return (
    <AuthLayout
      title="Neues Passwort"
      subtitle="Vergib ein neues Passwort für dein Konto."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {(
          [
            { id: 'password', label: 'Neues Passwort', value: password, setter: setPassword },
            {
              id: 'confirmPassword',
              label: 'Passwort bestätigen',
              value: confirmPassword,
              setter: setConfirmPassword,
            },
          ] as const
        ).map((field, i) => (
          <motion.div key={field.id} custom={i} variants={fieldVariants} initial="hidden" animate="visible">
            <label className="auth-label mb-2 block text-shell-fg/62" htmlFor={field.id}>
              {field.label}
            </label>
            <input
              id={field.id}
              type="password"
              autoComplete="new-password"
              required
              value={field.value}
              onChange={(e) => field.setter(e.target.value)}
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

        <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
          <button
            type="submit"
            disabled={submitting}
            className="auth-submit relative mt-1 w-full rounded-[0.9rem] bg-shell-cta-bg px-4 py-3 font-semibold text-shell-cta-fg shadow-lg shadow-black/20 transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Wird gespeichert …' : 'Passwort speichern'}
          </button>
        </motion.div>
      </form>
    </AuthLayout>
  )
}
