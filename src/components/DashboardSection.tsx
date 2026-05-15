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
      className={`rounded-2xl bg-white text-slate-900 shadow-sm ${compact ? 'p-4' : 'p-5'} ${className}`}
    >
      <div className={`flex items-center justify-between gap-2 ${compact ? 'mb-3' : 'mb-4'}`}>
        <h2 className="text-base font-bold text-hertha-blue">{title}</h2>
        {badge ? (
          <span className="rounded-full bg-hertha-blue/10 px-2.5 py-0.5 text-xs font-semibold text-hertha-blue">
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  )
}
