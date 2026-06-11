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
      <header className="relative z-10 sticky top-0 border-b border-shell-fg/10 bg-shell-bg/85 backdrop-blur-xl">
        <div className="accent-line absolute inset-x-0 top-0 h-px opacity-60" />
        <div className={`mx-auto flex ${maxWidth} items-center justify-between gap-3 px-4 py-3 sm:px-6`}>
          <div className="min-w-0">
            <p className="font-display-wide text-[9px] text-shell-fg/40">Hertha BSC</p>
            <h1 className="font-display truncate text-lg leading-tight sm:text-xl">{title}</h1>
          </div>
          {/* Desktop-Navigation */}
          <div className="hidden sm:flex shrink-0 items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>Fahrten</NavLink>
            <NavLink to="/spieltag" className={navLinkClass}>Spieltag</NavLink>
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
            className="sm:hidden rounded-lg px-3 py-1.5 text-sm font-medium text-shell-fg/50 transition-all duration-150 hover:bg-shell-fg/10 hover:text-shell-fg active:scale-[0.97]"
          >
            Abmelden
          </button>
        </div>
      </header>
      <main className={`relative z-10 mx-auto ${maxWidth} px-4 py-6 pb-24 sm:pb-8 sm:px-6`}>{children}</main>
      <BottomNav />
    </div>
  )
}
