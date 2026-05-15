import { mapParkingError } from './mapParkingError'
import { requireSupabase } from './supabase'
import type { Parkplatz, ParkplatzInsert, ParkingSuggestion } from '../types/parking'

const PARKPLATZ_SELECT =
  'id, fahrt_id, name, address, place_id, lat, lng, source, is_selected, created_by, created_at'

function mapRow(row: Record<string, unknown>): Parkplatz {
  return {
    id: row.id as string,
    fahrt_id: row.fahrt_id as string,
    name: row.name as string,
    address: row.address as string,
    place_id: (row.place_id as string | null) ?? null,
    lat: row.lat != null ? Number(row.lat) : null,
    lng: row.lng != null ? Number(row.lng) : null,
    source: row.source as Parkplatz['source'],
    is_selected: Boolean(row.is_selected),
    created_by: row.created_by as string,
    created_at: row.created_at as string,
  }
}

export async function fetchParkplaetze(fahrtId: string) {
  const { data, error } = await requireSupabase()
    .from('parkplaetze')
    .select(PARKPLATZ_SELECT)
    .eq('fahrt_id', fahrtId)
    .order('created_at', { ascending: true })

  if (error) {
    return { data: null, error: mapParkingError(error) }
  }

  const rows = (data ?? []).map(mapRow)
  rows.sort((a, b) => {
    if (a.is_selected !== b.is_selected) return a.is_selected ? -1 : 1
    return a.created_at.localeCompare(b.created_at)
  })

  return { data: rows, error: null }
}

export async function addParkplatz(payload: ParkplatzInsert) {
  const name = payload.name.trim()
  const address = payload.address.trim()

  if (!name || !address) {
    return { data: null, error: 'Name und Adresse sind erforderlich.' }
  }

  const { data, error } = await requireSupabase()
    .from('parkplaetze')
    .insert({
      fahrt_id: payload.fahrt_id,
      name,
      address,
      place_id: payload.place_id ?? null,
      lat: payload.lat ?? null,
      lng: payload.lng ?? null,
      source: payload.source,
      created_by: payload.created_by,
    })
    .select(PARKPLATZ_SELECT)
    .single()

  if (error) {
    return { data: null, error: mapParkingError(error) }
  }

  return { data: mapRow(data), error: null }
}

export async function addParkplatzFromSuggestion(
  fahrtId: string,
  userId: string,
  suggestion: ParkingSuggestion,
) {
  const client = requireSupabase()

  if (suggestion.placeId) {
    const existing = await client
      .from('parkplaetze')
      .select('id')
      .eq('fahrt_id', fahrtId)
      .eq('place_id', suggestion.placeId)
      .maybeSingle()

    if (existing.data) {
      return { data: null, error: 'Dieser Parkplatz ist bereits in der Liste.' }
    }
  }

  return addParkplatz({
    fahrt_id: fahrtId,
    name: suggestion.name,
    address: suggestion.address,
    place_id: suggestion.placeId,
    lat: suggestion.lat,
    lng: suggestion.lng,
    source: 'google',
    created_by: userId,
  })
}

export async function selectParkplatz(fahrtId: string, parkplatzId: string) {
  const client = requireSupabase()

  const { error: clearError } = await client
    .from('parkplaetze')
    .update({ is_selected: false })
    .eq('fahrt_id', fahrtId)
    .eq('is_selected', true)

  if (clearError) {
    return { error: mapParkingError(clearError) }
  }

  const { error } = await client
    .from('parkplaetze')
    .update({ is_selected: true })
    .eq('id', parkplatzId)
    .eq('fahrt_id', fahrtId)

  if (error) {
    return { error: mapParkingError(error) }
  }

  return { error: null }
}

export async function clearParkplatzSelection(fahrtId: string) {
  const { error } = await requireSupabase()
    .from('parkplaetze')
    .update({ is_selected: false })
    .eq('fahrt_id', fahrtId)
    .eq('is_selected', true)

  if (error) {
    return { error: mapParkingError(error) }
  }

  return { error: null }
}

export async function removeParkplatz(id: string) {
  const { error } = await requireSupabase().from('parkplaetze').delete().eq('id', id)

  if (error) {
    return { error: mapParkingError(error) }
  }

  return { error: null }
}
