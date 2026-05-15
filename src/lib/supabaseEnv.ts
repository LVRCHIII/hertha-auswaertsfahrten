function stripQuotes(value: string): string {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }
  return trimmed
}

function normalizeSupabaseUrl(raw: string): string {
  let url = stripQuotes(raw)
  if (!url) return url
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }
  return url.replace(/\/+$/, '')
}

function resolveAnonKey(): string {
  const legacy = import.meta.env.VITE_SUPABASE_ANON_KEY
  const publishable = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  return stripQuotes(legacy ?? publishable ?? '')
}

export type SupabaseEnv = {
  url: string
  anonKey: string
}

export type SupabaseConfigResult =
  | { ok: true; env: SupabaseEnv }
  | { ok: false; error: string }

export function resolveSupabaseConfig(): SupabaseConfigResult {
  const url = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL ?? '')
  const anonKey = resolveAnonKey()

  if (!url || !anonKey) {
    return {
      ok: false,
      error:
        'Supabase-Konfiguration fehlt. Lege eine .env-Datei an (nicht nur .env.example) mit VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY.',
    }
  }

  if (!url.includes('.supabase.co')) {
    return {
      ok: false,
      error:
        'VITE_SUPABASE_URL ist ungültig. Erwartet z. B. https://dein-projekt.supabase.co (aus Supabase → Project Settings → API).',
    }
  }

  const placeholderKeys = new Set([
    'dein-anon-key',
    'dein-vollstaendiger-anon-public-key',
  ])

  const looksLikePlaceholder =
    placeholderKeys.has(anonKey) ||
    anonKey.startsWith('dein-projekt') ||
    (anonKey.length < 20 && !anonKey.startsWith('sb_publishable_'))

  if (looksLikePlaceholder) {
    return {
      ok: false,
      error:
        'VITE_SUPABASE_ANON_KEY ist ungültig oder noch ein Platzhalter. Kopiere den vollständigen „anon public“-Key aus Supabase → Project Settings → API in die .env-Datei.',
    }
  }

  return { ok: true, env: { url, anonKey } }
}

export function formatAuthNetworkError(message: string): string {
  if (!message.toLowerCase().includes('failed to fetch')) {
    return message
  }

  return (
    'Verbindung zu Supabase fehlgeschlagen. Prüfe: (1) .env liegt im Projektroot (nicht nur .env.example), ' +
    '(2) VITE_SUPABASE_URL beginnt mit https:// und endet auf .supabase.co, ' +
    '(3) VITE_SUPABASE_ANON_KEY ist der komplette anon-Key (~200 Zeichen), ' +
    '(4) Dev-Server nach .env-Änderung neu starten (npm run dev).'
  )
}
