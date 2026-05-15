import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { resolveSupabaseConfig } from './supabaseEnv'

const config = resolveSupabaseConfig()

export const supabaseConfigError = config.ok ? null : config.error

export const supabase: SupabaseClient | null = config.ok
  ? createClient(config.env.url, config.env.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? 'Supabase ist nicht konfiguriert.')
  }
  return supabase
}
