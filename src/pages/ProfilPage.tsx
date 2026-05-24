import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { FutbologyCsvUpload } from '../components/FutbologyCsvUpload'
import { ProfileAvatar } from '../components/ProfileAvatar'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'

export function ProfilPage() {
  const { user } = useAuth()
  const {
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
  } = useProfile(user?.id, user?.email)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [displayName, setDisplayName] = useState('')
  const [homeAddress, setHomeAddress] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name)
      setHomeAddress(profile.home_address ?? '')
    }
  }, [profile])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(false)

    const result = await saveProfile({
      display_name: displayName,
      home_address: homeAddress.trim() || null,
    })
    if (!result.error) {
      setSaved(true)
    }
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    await uploadProfileAvatar(file)
  }

  return (
    <AppShell title="Profil">
      <Link to="/" className="mb-4 inline-block text-sm font-medium text-white/80 hover:text-white">
        ← Zurück zur Übersicht
      </Link>

      <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-sm sm:p-6">
        {loading ? <p className="text-sm text-slate-500">Profil wird geladen …</p> : null}

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        {!loading && !error ? (
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <ProfileAvatar
                name={displayName || 'Fan'}
                avatarUrl={profile?.avatar_url}
                size="lg"
              />
              <div className="flex flex-col gap-2 text-center sm:text-left">
                <p className="text-sm font-medium text-slate-700">Profilbild</p>
                <p className="text-xs text-slate-500">JPG, PNG oder WebP, max. 2 MB</p>
                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  <button
                    type="button"
                    disabled={uploadingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-hertha-mid px-4 py-2 text-sm font-semibold text-white transition hover:bg-hertha-blue disabled:opacity-60"
                  >
                    {uploadingAvatar ? 'Lädt …' : 'Bild hochladen'}
                  </button>
                  {profile?.avatar_url ? (
                    <button
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={() => void deleteProfileAvatar()}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                      Entfernen
                    </button>
                  ) : null}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => void handleAvatarChange(event)}
                />
                {avatarError ? (
                  <p className="text-sm text-red-600" role="alert">
                    {avatarError}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-600">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={user?.email ?? ''}
                readOnly
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
              />
            </div>

            <div>
              <label
                htmlFor="displayName"
                className="mb-1 block text-sm font-medium text-slate-600"
              >
                Anzeigename
              </label>
              <p className="mb-2 text-xs text-slate-500">
                So erscheinst du in der Mitfahrer- und Mitbringliste.
              </p>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value)
                  setSaved(false)
                }}
                maxLength={40}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-hertha-mid focus:outline-none focus:ring-2 focus:ring-hertha-mid/30"
              />
            </div>

            <div>
              <label htmlFor="homeAddress" className="mb-1 block text-sm font-medium text-slate-600">
                Abfahrt von Zuhause
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Straße und Ort — z. B. „Musterstraße 1, 10115 Berlin“. Auf der Fahrt-Seite siehst du
                dann, wann du losfahren musst, um rechtzeitig am Treffpunkt zu sein.
              </p>
              <input
                id="homeAddress"
                type="text"
                value={homeAddress}
                onChange={(event) => {
                  setHomeAddress(event.target.value)
                  setSaved(false)
                }}
                maxLength={200}
                placeholder="z. B. Kantstraße 12, 10623 Berlin"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-hertha-mid focus:outline-none focus:ring-2 focus:ring-hertha-mid/30"
              />
            </div>

            {saveError ? (
              <p className="text-sm text-red-600" role="alert">
                {saveError}
              </p>
            ) : null}

            {saved ? (
              <p className="text-sm font-medium text-green-700">Gespeichert.</p>
            ) : null}

            <button
              type="submit"
              disabled={saving || !displayName.trim()}
              className="rounded-lg bg-hertha-mid px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-hertha-blue disabled:opacity-60"
            >
              {saving ? 'Speichern …' : 'Speichern'}
            </button>

            <hr className="border-slate-200" />

            {user?.id ? (
              <FutbologyCsvUpload userId={user.id} />
            ) : null}
          </form>
        ) : null}
      </div>
    </AppShell>
  )
}
