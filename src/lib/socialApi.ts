import { mapMitbringError, mapMitfahrerError } from './mapSocialError'
import { requireSupabase } from './supabase'
import type { MitbringEintrag, MitfahrerEintrag } from '../types/social'

type ProfileSnippet = { display_name: string; avatar_url: string | null }

const MITFAHRER_BASE = 'fahrt_id, user_id, created_at'
const MITBRING_BASE = 'id, fahrt_id, user_id, item, created_at'

/** Expliziter FK-Name nach Migration fix_social_profile_fkeys */
const MITFAHRER_SELECT = `${MITFAHRER_BASE}, profile:profiles!mitfahrer_user_id_fkey(display_name, avatar_url)`
const MITBRING_SELECT = `${MITBRING_BASE}, profile:profiles!mitbringliste_user_id_fkey(display_name, avatar_url)`

type ProfileJoin = ProfileSnippet | ProfileSnippet[] | null

function normalizeProfile(profile: ProfileJoin): ProfileSnippet | null {
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

async function loadProfilesForUserIds(
  userIds: string[],
): Promise<Map<string, ProfileSnippet>> {
  const unique = [...new Set(userIds)]
  if (unique.length === 0) return new Map()

  const { data, error } = await requireSupabase()
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', unique)

  if (error || !data) return new Map()

  return new Map(
    data.map((row) => [
      row.id as string,
      {
        display_name: row.display_name as string,
        avatar_url: row.avatar_url as string | null,
      },
    ]),
  )
}

async function attachProfilesToMitfahrer(
  rows: Record<string, unknown>[],
): Promise<MitfahrerEintrag[]> {
  const profileMap = await loadProfilesForUserIds(rows.map((row) => row.user_id as string))
  return rows.map((row) => ({
    fahrt_id: row.fahrt_id as string,
    user_id: row.user_id as string,
    created_at: row.created_at as string,
    profile: profileMap.get(row.user_id as string) ?? null,
  }))
}

async function attachProfilesToMitbring(
  rows: Record<string, unknown>[],
): Promise<MitbringEintrag[]> {
  const profileMap = await loadProfilesForUserIds(rows.map((row) => row.user_id as string))
  return rows.map((row) => ({
    id: row.id as string,
    fahrt_id: row.fahrt_id as string,
    user_id: row.user_id as string,
    item: row.item as string,
    created_at: row.created_at as string,
    profile: profileMap.get(row.user_id as string) ?? null,
  }))
}

function isEmbedRelationshipError(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes('relationship') ||
    lower.includes('could not find') ||
    lower.includes('pgrst200') ||
    lower.includes('schema cache')
  )
}

export async function fetchMitfahrerForFahrten(fahrtIds: string[]) {
  if (fahrtIds.length === 0) {
    return { data: new Map<string, MitfahrerEintrag[]>(), error: null as string | null }
  }

  const client = requireSupabase()

  const embedded = await client
    .from('mitfahrer')
    .select(MITFAHRER_SELECT)
    .in('fahrt_id', fahrtIds)
    .order('created_at', { ascending: true })

  if (!embedded.error) {
    return { data: groupMitfahrerByFahrt(mapMitfahrerRows(embedded.data ?? [])), error: null }
  }

  if (!isEmbedRelationshipError(embedded.error.message ?? '')) {
    return { data: null, error: mapMitfahrerError(embedded.error) }
  }

  const fallback = await client
    .from('mitfahrer')
    .select(MITFAHRER_BASE)
    .in('fahrt_id', fahrtIds)
    .order('created_at', { ascending: true })

  if (fallback.error) {
    return { data: null, error: mapMitfahrerError(fallback.error) }
  }

  const rows = await attachProfilesToMitfahrer(fallback.data ?? [])
  return { data: groupMitfahrerByFahrt(rows), error: null }
}

function groupMitfahrerByFahrt(entries: MitfahrerEintrag[]): Map<string, MitfahrerEintrag[]> {
  const map = new Map<string, MitfahrerEintrag[]>()
  for (const entry of entries) {
    const list = map.get(entry.fahrt_id) ?? []
    list.push(entry)
    map.set(entry.fahrt_id, list)
  }
  return map
}

export async function fetchMitfahrer(fahrtId: string) {
  const client = requireSupabase()

  const embedded = await client
    .from('mitfahrer')
    .select(MITFAHRER_SELECT)
    .eq('fahrt_id', fahrtId)
    .order('created_at', { ascending: true })

  if (!embedded.error) {
    return { data: mapMitfahrerRows(embedded.data ?? []), error: null }
  }

  if (!isEmbedRelationshipError(embedded.error.message ?? '')) {
    return { data: null, error: mapMitfahrerError(embedded.error) }
  }

  const fallback = await client
    .from('mitfahrer')
    .select(MITFAHRER_BASE)
    .eq('fahrt_id', fahrtId)
    .order('created_at', { ascending: true })

  if (fallback.error) {
    return { data: null, error: mapMitfahrerError(fallback.error) }
  }

  const data = await attachProfilesToMitfahrer(fallback.data ?? [])
  return { data, error: null }
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
  const client = requireSupabase()

  const embedded = await client
    .from('mitbringliste')
    .select(MITBRING_SELECT)
    .eq('fahrt_id', fahrtId)
    .order('created_at', { ascending: true })

  if (!embedded.error) {
    return { data: mapMitbringRows(embedded.data ?? []), error: null }
  }

  if (!isEmbedRelationshipError(embedded.error.message ?? '')) {
    return { data: null, error: mapMitbringError(embedded.error) }
  }

  const fallback = await client
    .from('mitbringliste')
    .select(MITBRING_BASE)
    .eq('fahrt_id', fahrtId)
    .order('created_at', { ascending: true })

  if (fallback.error) {
    return { data: null, error: mapMitbringError(fallback.error) }
  }

  const data = await attachProfilesToMitbring(fallback.data ?? [])
  return { data, error: null }
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
