import { mapProfileError } from './mapSocialError'
import { requireSupabase } from './supabase'

const BUCKET = 'avatars'
const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function extensionForType(type: string): string {
  if (type === 'image/png') return 'png'
  if (type === 'image/webp') return 'webp'
  return 'jpg'
}

export function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Bitte JPG, PNG oder WebP wählen.'
  }
  if (file.size > MAX_BYTES) {
    return 'Das Bild darf maximal 2 MB groß sein.'
  }
  return null
}

export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<{ avatarUrl: string | null; error: string | null }> {
  const validation = validateAvatarFile(file)
  if (validation) return { avatarUrl: null, error: validation }

  const client = requireSupabase()
  const path = `${userId}/avatar.${extensionForType(file.type)}`

  const { error: uploadError } = await client.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
    cacheControl: '3600',
  })

  if (uploadError) {
    console.error('Avatar-Upload fehlgeschlagen:', uploadError)
    return {
      avatarUrl: null,
      error: uploadError.message || 'Profilbild konnte nicht hochgeladen werden.',
    }
  }

  const { data: urlData } = client.storage.from(BUCKET).getPublicUrl(path)
  const avatarUrl = `${urlData.publicUrl}?v=${Date.now()}`

  const { error: profileError } = await client
    .from('profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (profileError) {
    return { avatarUrl: null, error: mapProfileError(profileError) }
  }

  return { avatarUrl, error: null }
}

export async function removeAvatar(userId: string): Promise<{ error: string | null }> {
  const client = requireSupabase()

  const { data: files } = await client.storage.from(BUCKET).list(userId)
  if (files?.length) {
    const paths = files.map((file) => `${userId}/${file.name}`)
    await client.storage.from(BUCKET).remove(paths)
  }

  const { error } = await client
    .from('profiles')
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    return { error: mapProfileError(error) }
  }

  return { error: null }
}
