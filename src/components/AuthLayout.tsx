import type { ReactNode } from 'react'

type AuthLayoutProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hertha-blue px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <header className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-hertha-mid">
            Hertha BSC
          </p>
          <h1 className="mt-2 text-2xl font-bold text-hertha-blue">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          ) : null}
        </header>
        {children}
      </div>
    </div>
  )
}
