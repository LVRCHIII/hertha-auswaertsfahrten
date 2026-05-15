import { mapProfileError } from './mapSocialError'
import { requireSupabase } from './supabase'
import type { Profile, ProfileUpdate } from '../types/profile'

function defaultDisplayName(email: string): string {
  const local = email.split('@')[0]?.trim()
  return local || 'Fan'
}

export async function fetchProfile(userId: string): Promise<{
  profile: Profile | null
  error: string | null
}> {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    return { profile: null, error: mapProfileError(error) }
  }

  return { profile: data as Profile | null, error: null }
}

export async function ensureProfile(
  userId: string,
  email: string,
): Promise<{ profile: Profile | null; error: string | null }> {
  const existing = await fetchProfile(userId)
  if (existing.error) return existing
  if (existing.profile) return existing

  const { data, error } = await requireSupabase()
    .from('profiles')
    .insert({ id: userId, display_name: defaultDisplayName(email) })
    .select()
    .single()

  if (error) {
    return { profile: null, error: mapProfileError(error) }
  }

  return { profile: data as Profile, error: null }
}

export async function updateProfile(
  userId: string,
  payload: ProfileUpdate,
): Promise<{ error: string | null }> {
  const trimmedName = payload.display_name.trim()
  if (!trimmedName) {
    return { error: 'Bitte einen Anzeigenamen eingeben.' }
  }

  const home = payload.home_address?.trim() || null

  const { error } = await requireSupabase()
    .from('profiles')
    .update({
      display_name: trimmedName,
      home_address: home,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    return { error: mapProfileError(error) }
  }

  return { error: null }
}

/** @deprecated Nutze updateProfile */
export async function updateDisplayName(
  userId: string,
  displayName: string,
): Promise<{ error: string | null }> {
  return updateProfile(userId, { display_name: displayName, home_address: null })
}
