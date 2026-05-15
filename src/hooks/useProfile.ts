import { useCallback, useEffect, useState } from 'react'
import { removeAvatar, uploadAvatar } from '../lib/avatarStorage'
import { ensureProfile, fetchProfile, updateProfile } from '../lib/profilesApi'
import type { Profile, ProfileUpdate } from '../types/profile'

export function useProfile(userId: string | undefined, email: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId || !email) {
      setProfile(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    let result = await fetchProfile(userId)

    if (!result.profile && !result.error) {
      result = await ensureProfile(userId, email)
    }

    if (result.error) {
      setError(result.error)
      setProfile(null)
    } else {
      setProfile(result.profile)
    }

    setLoading(false)
  }, [userId, email])

  useEffect(() => {
    void load()
  }, [load])

  const saveProfile = useCallback(
    async (payload: ProfileUpdate) => {
      if (!userId) return { error: 'Nicht angemeldet.' }

      setSaveError(null)
      setSaving(true)

      const result = await updateProfile(userId, payload)

      setSaving(false)

      if (result.error) {
        setSaveError(result.error)
        return result
      }

      await load()
      return { error: null }
    },
    [userId, load],
  )

  const uploadProfileAvatar = useCallback(
    async (file: File) => {
      if (!userId) return { error: 'Nicht angemeldet.' }

      setAvatarError(null)
      setUploadingAvatar(true)

      const result = await uploadAvatar(userId, file)

      setUploadingAvatar(false)

      if (result.error) {
        setAvatarError(result.error)
        return result
      }

      await load()
      return { error: null }
    },
    [userId, load],
  )

  const deleteProfileAvatar = useCallback(async () => {
    if (!userId) return { error: 'Nicht angemeldet.' }

    setAvatarError(null)
    setUploadingAvatar(true)

    const result = await removeAvatar(userId)

    setUploadingAvatar(false)

    if (result.error) {
      setAvatarError(result.error)
      return result
    }

    await load()
    return { error: null }
  }, [userId, load])

  return {
    profile,
    loading,
    error,
    saving,
    saveError,
    uploadingAvatar,
    avatarError,
    saveProfile,
    uploadProfileAvatar,
    deleteProfileAvatar,
    reload: load,
  }
}
