import { Link, NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { BottomNav } from './BottomNav'

type AppShellProps = {
  children: ReactNode
  title?: string
  /** Breiteres Layout für Dashboard-Seiten (Web). */
  wide?: boolean
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 active:scale-[0.97] ${
    isActive
      ? 'bg-shell-fg/15 text-shell-fg'
      : 'text-shell-fg/60 hover:bg-shell-fg/10 hover:text-shell-fg'
  }`

export function AppShell({ children, title = 'Hertha Auswärtsfahrten', wide = false }: AppShellProps) {
  const maxWidth = wide ? 'max-w-6xl' : 'max-w-2xl'
  const { signOut } = useAuth()

  return (
    <div className="relative z-10 min-h-dvh bg-transparent text-shell-fg">
      <header className="sticky top-0 z-40 border-b border-shell-fg/10 bg-shell-bg">
        <div className="accent-line absolute inset-x-0 top-0 h-px opacity-60" />
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            to="/"
            aria-label="Hertha Auswärtsfahrten, zur Startseite"
            className="group shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shell-cta-bg focus-visible:ring-offset-4 focus-visible:ring-offset-shell-bg"
          >
            <span className="font-display-wide block text-[9px] text-shell-fg/45 transition group-hover:text-shell-fg/65">
              Hertha BSC
            </span>
            <span className="font-display block whitespace-nowrap text-lg leading-tight text-shell-fg transition group-hover:opacity-80 sm:text-xl">
              Auswärtsfahrten
            </span>
          </Link>
          {/* Desktop-Navigation */}
          <div className="hidden shrink-0 items-center gap-1 lg:flex">
            <NavLink to="/" end className={navLinkClass}>Fahrten</NavLink>
            <NavLink to="/spieltag" className={navLinkClass}>Spieltag</NavLink>
            <NavLink to="/rueckblicke" className={navLinkClass}>Rückblicke</NavLink>
            <NavLink to="/profil" className={navLinkClass}>Profil</NavLink>
            <Link
              to="/fahrten/neu"
              className="ml-2 rounded-lg bg-shell-cta-bg px-3.5 py-1.5 text-sm font-semibold text-shell-cta-fg transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
            >
              + Fahrt
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="ml-1 rounded-lg px-3 py-1.5 text-sm font-medium text-shell-fg/50 transition-all duration-150 hover:bg-shell-fg/10 hover:text-shell-fg active:scale-[0.97]"
            >
              Abmelden
            </button>
          </div>
          {/* Mobile: nur Abmelden-Button */}
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-shell-fg/50 transition-all duration-150 hover:bg-shell-fg/10 hover:text-shell-fg active:scale-[0.97] lg:hidden"
          >
            Abmelden
          </button>
        </div>
      </header>
      <main className={`relative z-0 mx-auto ${maxWidth} px-4 py-6 pb-24 sm:px-6 lg:pb-8`}>
        <h1 className="sr-only">{title}</h1>
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
