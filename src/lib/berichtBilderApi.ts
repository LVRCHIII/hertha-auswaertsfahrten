import { requireSupabase } from './supabase'
import { uploadBerichtImage, deleteBerichtImage } from './berichtStorage'

export type BerichtBild = {
  id: string
  fahrt_id: string  // uuid
  uploaded_by: string
  path: string
  url: string
  position: number
  created_at: string
}

export async function fetchBerichtBilder(
  fahrtId: string,
): Promise<{ bilder: BerichtBild[]; error: string | null }> {
  const { data, error } = await requireSupabase()
    .from('bericht_bilder')
    .select('*')
    .eq('fahrt_id', fahrtId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return { bilder: [], error: error.message }
  return { bilder: (data as BerichtBild[]) ?? [], error: null }
}

export async function addBerichtBild(
  fahrtId: string,
  userId: string,
  file: File,
): Promise<{ bild: BerichtBild | null; error: string | null }> {
  const upload = await uploadBerichtImage(fahrtId, userId, file)
  if (upload.error || !upload.url || !upload.path) {
    return { bild: null, error: upload.error ?? 'Upload fehlgeschlagen.' }
  }

  const maxPositionResult = await requireSupabase()
    .from('bericht_bilder')
    .select('position')
    .eq('fahrt_id', fahrtId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextPosition = ((maxPositionResult.data as { position: number } | null)?.position ?? -1) + 1

  const { data, error } = await requireSupabase()
    .from('bericht_bilder')
    .insert({
      fahrt_id: fahrtId,
      uploaded_by: userId,
      path: upload.path,
      url: upload.url,
      position: nextPosition,
    })
    .select('*')
    .single()

  if (error) {
    await deleteBerichtImage(upload.path)
    return { bild: null, error: error.message }
  }

  return { bild: data as BerichtBild, error: null }
}

export async function removeBerichtBild(
  bildId: string,
  path: string,
): Promise<{ error: string | null }> {
  const { error } = await requireSupabase()
    .from('bericht_bilder')
    .delete()
    .eq('id', bildId)

  if (error) return { error: error.message }

  await deleteBerichtImage(path)
  return { error: null }
}
