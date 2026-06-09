import { extractBerichtPlainText, normalizeBerichtDoc } from './berichtContent'
import { mapBerichtError } from './mapBerichtError'
import { requireSupabase } from './supabase'
import type { BerichtMeta, Spieltagsbericht } from '../types/bericht'

const BERICHT_SELECT =
  'fahrt_id, author_id, content_json, content_text, created_at, updated_at, ergebnis_heim, ergebnis_gast, zuschauer, bewertung_spiel, bewertung_atmosphaere, bewertung_pommes, author:profiles!spieltagsberichte_author_id_fkey(display_name, avatar_url)'

type ProfileJoin = { display_name: string; avatar_url: string | null } | null

function mapBerichtRow(row: Record<string, unknown>): Spieltagsbericht {
  const author = row.author as ProfileJoin | ProfileJoin[] | null
  const profile = Array.isArray(author) ? (author[0] ?? null) : author

  return {
    fahrt_id: row.fahrt_id as string,
    author_id: row.author_id as string,
    content_json: (row.content_json as Record<string, unknown>) ?? {},
    content_text: (row.content_text as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    author: profile,
    ergebnis_heim: (row.ergebnis_heim as number | null) ?? null,
    ergebnis_gast: (row.ergebnis_gast as number | null) ?? null,
    zuschauer: (row.zuschauer as number | null) ?? null,
    bewertung_spiel: (row.bewertung_spiel as number | null) ?? null,
    bewertung_atmosphaere: (row.bewertung_atmosphaere as number | null) ?? null,
    bewertung_pommes: (row.bewertung_pommes as number | null) ?? null,
  }
}

export async function fetchSpieltagsbericht(
  fahrtId: string,
): Promise<{ bericht: Spieltagsbericht | null; error: string | null }> {
  const { data, error } = await requireSupabase()
    .from('spieltagsberichte')
    .select(BERICHT_SELECT)
    .eq('fahrt_id', fahrtId)
    .maybeSingle()

  if (error) {
    return { bericht: null, error: mapBerichtError(error) }
  }

  if (!data) {
    return { bericht: null, error: null }
  }

  return { bericht: mapBerichtRow(data as Record<string, unknown>), error: null }
}

export async function saveSpieltagsbericht(
  fahrtId: string,
  authorId: string,
  contentJson: Record<string, unknown>,
  existingAuthorId?: string,
  meta?: BerichtMeta,
): Promise<{ bericht: Spieltagsbericht | null; error: string | null }> {
  const doc = normalizeBerichtDoc(contentJson)
  const payload = {
    fahrt_id: fahrtId,
    author_id: authorId,
    content_json: doc,
    content_text: extractBerichtPlainText(doc) || null,
    updated_at: new Date().toISOString(),
    ...(meta ?? {}),
  }

  const client = requireSupabase()
  const isUpdate = existingAuthorId === authorId

  const query = isUpdate
    ? client.from('spieltagsberichte').update(payload).eq('fahrt_id', fahrtId)
    : client.from('spieltagsberichte').insert(payload)

  const { data, error } = await query.select(BERICHT_SELECT).single()

  if (error) {
    return { bericht: null, error: mapBerichtError(error) }
  }

  return { bericht: mapBerichtRow(data as Record<string, unknown>), error: null }
}

export async function deleteSpieltagsbericht(
  fahrtId: string,
): Promise<{ error: string | null }> {
  const { error } = await requireSupabase()
    .from('spieltagsberichte')
    .delete()
    .eq('fahrt_id', fahrtId)

  if (error) {
    return { error: mapBerichtError(error) }
  }

  return { error: null }
}
