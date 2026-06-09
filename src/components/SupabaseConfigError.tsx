import { supabaseConfigError } from '../lib/supabase'

export function SupabaseConfigError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-shell-bg px-4 py-8 text-shell-fg">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-slate-900 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-card-accent/70">Hertha BSC</p>
        <h1 className="mt-2 text-xl font-bold text-card-accent">Supabase-Konfiguration</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-700" role="alert">
          {supabaseConfigError}
        </p>
        <div className="mt-6 space-y-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-800">Checkliste:</p>
          <ol className="list-inside list-decimal space-y-1">
            <li>
              Datei <code className="rounded bg-slate-200 px-1">.env</code> im Projektroot (nicht nur
              .env.example)
            </li>
            <li>
              <code className="rounded bg-slate-200 px-1">VITE_SUPABASE_URL</code> aus Supabase → API
            </li>
            <li>
              <code className="rounded bg-slate-200 px-1">VITE_SUPABASE_ANON_KEY</code> — kompletter
              anon-Key
            </li>
            <li>
              Dev-Server neu starten: <code className="rounded bg-slate-200 px-1">npm run dev</code>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
