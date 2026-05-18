import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

type AppShellProps = {
  children: ReactNode
  title?: string
  /** Breiteres Layout für Dashboard-Seiten (Web). */
  wide?: boolean
}

export function AppShell({ children, title = 'Hertha Auswärtsfahrten', wide = false }: AppShellProps) {
  const maxWidth = wide ? 'max-w-6xl' : 'max-w-2xl'
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-hertha-blue text-white">
      <header className="sticky top-0 z-10 border-b border-white/20 bg-hertha-blue/95 backdrop-blur-sm">
        <div className={`mx-auto flex ${maxWidth} items-center justify-between gap-3 px-4 py-4 sm:px-6`}>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Hertha BSC</p>
            <h1 className="truncate text-lg font-bold sm:text-xl">{title}</h1>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <Link
              to="/spieltag"
              className="rounded-lg border border-white/40 px-3 py-1.5 text-sm font-medium transition hover:bg-white/10"
            >
              Spieltag
            </Link>
            <Link
              to="/profil"
              className="rounded-lg border border-white/40 px-3 py-1.5 text-sm font-medium transition hover:bg-white/10"
            >
              Profil
            </Link>
            <Link
              to="/fahrten/neu"
              className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-hertha-blue transition hover:bg-white/90"
            >
              + Fahrt
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-lg border border-white/40 px-3 py-1.5 text-sm font-medium transition hover:bg-white/10"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>
      <main className={`mx-auto ${maxWidth} px-4 py-6 sm:px-6`}>{children}</main>
    </div>
  )
}
