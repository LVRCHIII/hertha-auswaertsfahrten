import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type AuthLayoutProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center overflow-hidden bg-transparent px-4 py-8">
      {/* Animierte Hintergrund-Blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="auth-blob-1 absolute -left-32 -top-32 h-96 w-96 rounded-full bg-shell-fg/10 blur-3xl" />
        <div className="auth-blob-2 absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-shell-cta-bg/15 blur-3xl" />
        <div className="auth-blob-3 absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-shell-fg/6 blur-2xl" />
      </div>

      {/* Card */}
      <motion.div
        className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.header
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-card-accent/70">
            Hertha BSC
          </p>
          <h1 className="mt-2 text-2xl font-bold text-card-accent">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          ) : null}
        </motion.header>
        {children}
      </motion.div>
    </div>
  )
}
