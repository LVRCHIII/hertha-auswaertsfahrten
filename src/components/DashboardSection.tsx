import type { ReactNode } from 'react'

type DashboardSectionProps = {
  title: string
  children: ReactNode
  badge?: string
  compact?: boolean
  className?: string
}

export function DashboardSection({
  title,
  children,
  badge,
  compact = false,
  className = '',
}: DashboardSectionProps) {
  return (
    <section
      className={`glass-card rounded-2xl ${compact ? 'p-4' : 'p-5'} ${className}`}
    >
      <div className={`flex items-center justify-between gap-2 ${compact ? 'mb-3' : 'mb-4'}`}>
        <h2 className="font-display text-lg text-shell-fg">{title}</h2>
        {badge ? (
          <span className="rounded-full bg-shell-cta-bg/15 px-2.5 py-0.5 text-xs font-semibold text-shell-fg">
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  )
}
