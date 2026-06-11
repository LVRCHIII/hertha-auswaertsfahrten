import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { FutbologyCsvUpload } from '../components/FutbologyCsvUpload'
import { SaisonExport } from '../components/SaisonExport'
import { ProfileAvatar } from '../components/ProfileAvatar'
import { useAuth } from '../contexts/AuthContext'
import { THEMES, useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { useProfile } from '../hooks/useProfile'

export function ProfilPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const toast = useToast()
  const {
    profile,
    loading,
    error,
    saving,
    uploadingAvatar,
    avatarError,
    saveProfile,
    uploadProfileAvatar,
    deleteProfileAvatar,
  } = useProfile(user?.id, user?.email)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [displayName, setDisplayName] = useState('')
  const [homeAddress, setHomeAddress] = useState('')

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name)
      setHomeAddress(profile.home_address ?? '')
    }
  }, [profile])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = await saveProfile({
      display_name: displayName,
      home_address: homeAddress.trim() || null,
    })
    if (!result.error) {
      toast.success('Profil gespeichert!')
    } else {
      toast.error(result.error)
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
      <Link to="/" className="mb-4 inline-block text-sm font-medium text-shell-fg/60 transition hover:text-shell-fg">
        ← Zurück zur Übersicht
      </Link>

      <div className="mb-6">
        <p className="font-display-wide text-[10px] text-shell-fg/40">Einstellungen</p>
        <h2 className="font-display mt-1 text-2xl text-shell-fg sm:text-3xl">Dein Profil</h2>
      </div>

      <div className="space-y-4">
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        {loading ? <p className="text-sm text-shell-fg/55">Profil wird geladen …</p> : null}

        {error ? (
          <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200" role="alert">
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
                <p className="text-sm font-medium text-shell-fg/80">Profilbild</p>
                <p className="text-xs text-shell-fg/55">JPG, PNG oder WebP, max. 2 MB</p>
                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  <button
                    type="button"
                    disabled={uploadingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-shell-cta-bg px-4 py-2 text-sm font-semibold text-shell-cta-fg transition hover:opacity-90 disabled:opacity-60"
                  >
                    {uploadingAvatar ? 'Lädt …' : 'Bild hochladen'}
                  </button>
                  {profile?.avatar_url ? (
                    <button
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={() => void deleteProfileAvatar()}
                      className="rounded-lg border border-shell-fg/15 px-4 py-2 text-sm font-medium text-shell-fg/70 transition hover:bg-shell-fg/10 disabled:opacity-60"
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
                  <p className="text-sm text-red-300" role="alert">
                    {avatarError}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-shell-fg/70">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={user?.email ?? ''}
                readOnly
                className="w-full rounded-lg border border-shell-fg/15 bg-shell-fg/6 px-3 py-2 text-sm text-shell-fg/70"
              />
            </div>

            <div>
              <label
                htmlFor="displayName"
                className="mb-1 block text-sm font-medium text-shell-fg/70"
              >
                Anzeigename
              </label>
              <p className="mb-2 text-xs text-shell-fg/55">
                So erscheinst du in der Mitfahrer- und Mitbringliste.
              </p>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value)
                }}
                maxLength={40}
                required
                className="w-full rounded-lg border border-shell-fg/15 px-3 py-2 text-sm text-shell-fg focus:border-shell-cta-bg focus:outline-none focus:ring-2 focus:ring-shell-cta-bg/40"
              />
            </div>

            <div>
              <label htmlFor="homeAddress" className="mb-1 block text-sm font-medium text-shell-fg/70">
                Abfahrt von Zuhause
              </label>
              <p className="mb-2 text-xs text-shell-fg/55">
                Straße und Ort — z. B. „Musterstraße 1, 10115 Berlin“. Auf der Fahrt-Seite siehst du
                dann, wann du losfahren musst, um rechtzeitig am Treffpunkt zu sein.
              </p>
              <input
                id="homeAddress"
                type="text"
                value={homeAddress}
                onChange={(event) => {
                  setHomeAddress(event.target.value)
                }}
                maxLength={200}
                placeholder="z. B. Kantstraße 12, 10623 Berlin"
                className="w-full rounded-lg border border-shell-fg/15 px-3 py-2 text-sm text-shell-fg placeholder:text-shell-fg/35 focus:border-shell-cta-bg focus:outline-none focus:ring-2 focus:ring-shell-cta-bg/40"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !displayName.trim()}
              className="rounded-lg bg-shell-cta-bg px-5 py-2.5 text-sm font-semibold text-shell-cta-fg transition hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
            >
              {saving ? 'Speichern …' : 'Speichern'}
            </button>
          </form>
        ) : null}
      </div>

      {!loading && !error ? (
        <>
          <div className="glass-card rounded-2xl p-5 sm:p-6">
            <div>
              <p className="font-display mb-3 text-lg text-shell-fg">App-Design</p>
              <div className="grid grid-cols-5 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    title={t.label}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition ${
                      theme === t.id
                        ? 'border-shell-cta-bg shadow-sm'
                        : 'border-transparent hover:border-shell-fg/15'
                    }`}
                  >
                    <span
                      className="h-8 w-full overflow-hidden rounded-lg"
                      style={{ border: '1px solid rgba(0,0,0,0.1)' }}
                    >
                      <span className="flex h-full">
                        <span className="w-3/5" style={{ background: t.previewBg }} />
                        <span className="w-2/5" style={{ background: t.previewFg }} />
                      </span>
                    </span>
                    <span className="text-[11px] font-medium text-shell-fg/70">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {user?.id ? (
            <div className="glass-card rounded-2xl p-5 sm:p-6">
              <FutbologyCsvUpload userId={user.id} />
            </div>
          ) : null}

          <div className="glass-card rounded-2xl p-5 sm:p-6">
            <SaisonExport />
          </div>
        </>
      ) : null}
      </div>
    </AppShell>
  )
}
