import type { ReactNode } from 'react'

type DashboardSectionProps = {
  title: string
  children: ReactNode
  badge?: string
}

export function DashboardSection({ title, children, badge }: DashboardSectionProps) {
  return (
    <section className="rounded-2xl bg-white p-5 text-slate-900 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
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
