import { mapBerichtStorageError } from './mapBerichtError'
import { requireSupabase } from './supabase'

const BUCKET = 'bericht-images'
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function extensionForType(type: string): string {
  if (type === 'image/png') return 'png'
  if (type === 'image/webp') return 'webp'
  return 'jpg'
}

export function validateBerichtImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Bitte JPG, PNG oder WebP wählen.'
  }
  if (file.size > MAX_BYTES) {
    return 'Das Bild darf maximal 5 MB groß sein.'
  }
  return null
}

export async function uploadBerichtImage(
  fahrtId: string,
  userId: string,
  file: File,
): Promise<{ url: string | null; path: string | null; error: string | null }> {
  const validation = validateBerichtImageFile(file)
  if (validation) return { url: null, path: null, error: validation }

  const client = requireSupabase()
  const path = `${fahrtId}/${userId}/${crypto.randomUUID()}.${extensionForType(file.type)}`

  const { error: uploadError } = await client.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
    cacheControl: '3600',
  })

  if (uploadError) {
    console.error('Berichtbild-Upload fehlgeschlagen:', uploadError)
    return {
      url: null,
      path: null,
      error: mapBerichtStorageError(uploadError.message),
    }
  }

  const { data: urlData } = client.storage.from(BUCKET).getPublicUrl(path)
  return { url: urlData.publicUrl, path, error: null }
}

export async function deleteBerichtImage(path: string): Promise<void> {
  await requireSupabase().storage.from(BUCKET).remove([path])
}
