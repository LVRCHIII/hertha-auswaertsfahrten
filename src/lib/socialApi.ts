import { mapMitbringError, mapMitfahrerError } from './mapSocialError'
import { requireSupabase } from './supabase'
import type { MitbringEintrag, MitfahrerEintrag } from '../types/social'

const MITFAHRER_SELECT =
  'fahrt_id, user_id, created_at, profile:profiles(display_name, avatar_url)'
const MITBRING_SELECT =
  'id, fahrt_id, user_id, item, created_at, profile:profiles(display_name, avatar_url)'

type ProfileJoin =
  | { display_name: string; avatar_url: string | null }
  | { display_name: string; avatar_url: string | null }[]
  | null

function normalizeProfile(
  profile: ProfileJoin,
): { display_name: string; avatar_url: string | null } | null {
  if (!profile) return null
  if (Array.isArray(profile)) return profile[0] ?? null
  return profile
}

function mapMitfahrerRows(rows: Record<string, unknown>[]): MitfahrerEintrag[] {
  return rows.map((row) => ({
    fahrt_id: row.fahrt_id as string,
    user_id: row.user_id as string,
    created_at: row.created_at as string,
    profile: normalizeProfile(row.profile as ProfileJoin),
  }))
}

function mapMitbringRows(rows: Record<string, unknown>[]): MitbringEintrag[] {
  return rows.map((row) => ({
    id: row.id as string,
    fahrt_id: row.fahrt_id as string,
    user_id: row.user_id as string,
    item: row.item as string,
    created_at: row.created_at as string,
    profile: normalizeProfile(row.profile as ProfileJoin),
  }))
}

export async function fetchMitfahrer(fahrtId: string) {
  const { data, error } = await requireSupabase()
    .from('mitfahrer')
    .select(MITFAHRER_SELECT)
    .eq('fahrt_id', fahrtId)
    .order('created_at', { ascending: true })

  if (error) {
    return { data: null, error: mapMitfahrerError(error) }
  }

  return { data: mapMitfahrerRows(data ?? []), error: null }
}

export async function joinMitfahrer(fahrtId: string, userId: string) {
  const { error } = await requireSupabase().from('mitfahrer').insert({
    fahrt_id: fahrtId,
    user_id: userId,
  })

  if (error) {
    return { error: mapMitfahrerError(error) }
  }

  return { error: null }
}

export async function leaveMitfahrer(fahrtId: string, userId: string) {
  const { error } = await requireSupabase()
    .from('mitfahrer')
    .delete()
    .eq('fahrt_id', fahrtId)
    .eq('user_id', userId)

  if (error) {
    return { error: mapMitfahrerError(error) }
  }

  return { error: null }
}

export async function fetchMitbringliste(fahrtId: string) {
  const { data, error } = await requireSupabase()
    .from('mitbringliste')
    .select(MITBRING_SELECT)
    .eq('fahrt_id', fahrtId)
    .order('created_at', { ascending: true })

  if (error) {
    return { data: null, error: mapMitbringError(error) }
  }

  return { data: mapMitbringRows(data ?? []), error: null }
}

export async function addMitbringItem(fahrtId: string, userId: string, item: string) {
  const trimmed = item.trim()
  if (!trimmed) {
    return { error: 'Bitte eintragen, was du mitbringst.' }
  }

  const { error } = await requireSupabase().from('mitbringliste').insert({
    fahrt_id: fahrtId,
    user_id: userId,
    item: trimmed,
  })

  if (error) {
    return { error: mapMitbringError(error) }
  }

  return { error: null }
}

export async function removeMitbringItem(id: string) {
  const { error } = await requireSupabase().from('mitbringliste').delete().eq('id', id)

  if (error) {
    return { error: mapMitbringError(error) }
  }

  return { error: null }
}
