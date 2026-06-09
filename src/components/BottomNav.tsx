import { NavLink } from 'react-router-dom'

type NavItem = {
  to: string
  label: string
  icon: React.ReactNode
  cta?: boolean
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <polyline points="9 21 9 12 15 12 15 21" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="h-5 w-5">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Fahrten', icon: <HomeIcon /> },
  { to: '/spieltag', label: 'Spieltag', icon: <CalendarIcon /> },
  { to: '/fahrten/neu', label: 'Neu', icon: <PlusIcon />, cta: true },
  { to: '/profil', label: 'Profil', icon: <UserIcon /> },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-shell-fg/15 bg-shell-bg/92 backdrop-blur-md">
      <div className="flex h-16 items-stretch">
        {NAV_ITEMS.map((item) =>
          item.cta ? (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-1 flex-col items-center justify-center"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-shell-cta-bg text-shell-cta-fg shadow-lg transition-all duration-150 active:scale-90">
                {item.icon}
              </span>
            </NavLink>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `relative flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-all duration-150 active:scale-95 ${
                  isActive ? 'text-shell-fg' : 'text-shell-fg/40'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`transition-transform duration-150 ${isActive ? 'scale-110' : 'scale-100'}`}>
                    {item.icon}
                  </span>
                  <span className={`transition-all duration-150 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                  <span className={`absolute bottom-1.5 h-0.5 w-4 rounded-full bg-shell-fg transition-all duration-200 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                </>
              )}
            </NavLink>
          ),
        )}
      </div>
    </nav>
  )
}
