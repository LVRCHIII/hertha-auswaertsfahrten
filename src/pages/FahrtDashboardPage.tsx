import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { DashboardSection } from '../components/DashboardSection'
import { MatchupWappen } from '../components/MatchupWappen'
import { HomeDepartureBlock } from '../components/HomeDepartureBlock'
import { MitbringlisteSection } from '../components/MitbringlisteSection'
import { MitfahrerSection } from '../components/MitfahrerSection'
import { ParkplatzSection } from '../components/ParkplatzSection'
import { useAuth } from '../contexts/AuthContext'
import { useFahrt } from '../hooks/useFahrt'
import { useProfile } from '../hooks/useProfile'
import { deleteFahrt } from '../lib/fahrtenApi'
import { useParkplaetze } from '../hooks/useParkplaetze'
import { useRoutePlan } from '../hooks/useRoutePlan'
import {
  buildGoogleMapsDirectionsUrl,
  calculateAbfahrtszeit,
  calculateAnkunftszeit,
  formatDistance,
  formatDuration,
} from '../lib/departureCalc'
import { formatAnpfiff, formatSpielDatum, formatUhrzeit } from '../lib/fahrtFormat'
import { HERTHA_TREFFPUNKT, isDefaultTreffpunkt } from '../lib/defaultTreffpunkt'
import {
  departureTimeForHomeLeg,
  departureTimeForTraffic,
  getRouteEndpoints,
  qualifyBerlinAddress,
} from '../lib/routeAddresses'

const PUFFER_OPTIONS = [
  { label: '1,5 Std.', minutes: 90 },
  { label: '2 Std.', minutes: 120 },
] as const

export function FahrtDashboardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile } = useProfile(user?.id, user?.email)
  const { fahrt, loading, error } = useFahrt(id)
  const parkplaetze = useParkplaetze(id)
  const selectedParkplatz = parkplaetze.entries.find((entry) => entry.is_selected) ?? null
  const [pufferMinuten, setPufferMinuten] = useState(90)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const routeEndpoints = fahrt ? getRouteEndpoints(fahrt, selectedParkplatz) : null
  const route = useRoutePlan(
    routeEndpoints?.origin ?? '',
    routeEndpoints?.destination ?? '',
    fahrt ? departureTimeForTraffic(fahrt.spiel_at, pufferMinuten) : undefined,
  )

  const abfahrtszeit =
    fahrt && route.status === 'ready'
      ? calculateAbfahrtszeit(fahrt.spiel_at, route.plan.durationSeconds, pufferMinuten)
      : null

  const homeAddress = profile?.home_address?.trim() ?? ''
  const homeOrigin = homeAddress ? qualifyBerlinAddress(homeAddress) : ''
  const homeRoute = useRoutePlan(
    homeOrigin,
    routeEndpoints?.originResolved ?? '',
    abfahrtszeit ? departureTimeForHomeLeg(abfahrtszeit) : undefined,
  )

  if (loading) {
    return (
      <AppShell title="Fahrt laden …" wide>
        <p className="text-center text-white/80">Wird geladen …</p>
      </AppShell>
    )
  }

  if (error || !fahrt) {
    return (
      <AppShell title="Fahrt" wide>
        <p className="rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-100" role="alert">
          {error ?? 'Fahrt nicht gefunden.'}
        </p>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-white underline">
          ← Zurück zur Übersicht
        </Link>
      </AppShell>
    )
  }

  const trip = fahrt
  const mapsUrl = routeEndpoints
    ? buildGoogleMapsDirectionsUrl(routeEndpoints.origin, routeEndpoints.destination)
    : '#'

  const canDelete = user?.id === trip.created_by

  async function handleDelete() {
    const confirmed = window.confirm(
      `Fahrt „${trip.gegner}“ wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`,
    )
    if (!confirmed) return

    setDeleteError(null)
    setDeleting(true)

    const result = await deleteFahrt(trip.id)
    setDeleting(false)

    if (result.error) {
      setDeleteError(result.error)
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <AppShell title={trip.gegner} wide>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="text-sm font-medium text-white/80 hover:text-white">
          ← Alle Fahrten
        </Link>
        {canDelete ? (
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={deleting}
            className="text-sm font-medium text-red-200 transition hover:text-white disabled:opacity-60"
          >
            {deleting ? 'Wird gelöscht …' : 'Fahrt löschen'}
          </button>
        ) : null}
      </div>

      {deleteError ? (
        <p className="mb-4 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-100" role="alert">
          {deleteError}
        </p>
      ) : null}

      {/* Kopfzeile: Matchup + Kerninfos */}
      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <MatchupWappen gegner={trip.gegner} size="md" />
          <dl className="grid flex-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-slate-500">Anpfiff</dt>
              <dd className="font-semibold text-slate-900">
                {formatSpielDatum(trip.spiel_at)}, {formatAnpfiff(trip.spiel_at)} Uhr
              </dd>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <dt className="text-slate-500">Stadion</dt>
              <dd className="font-semibold text-slate-900">{trip.stadion}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Treffpunkt</dt>
              <dd className="font-semibold text-slate-900">
                {routeEndpoints?.originLabel ?? HERTHA_TREFFPUNKT.label}
                <a
                  href={HERTHA_TREFFPUNKT.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 font-medium text-hertha-mid hover:underline"
                >
                  Karte
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Hauptbereich: Abfahrt + Route nebeneinander */}
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <DashboardSection title="Abfahrt & Route" compact className="lg:col-span-3">
          {routeEndpoints?.destinationViaParkplatz ? (
            <p className="mb-3 rounded-lg bg-hertha-blue/10 px-3 py-2 text-sm text-hertha-blue">
              Routenziel: gewählter Parkplatz „{routeEndpoints.destinationLabel}“
            </p>
          ) : null}
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-6">
            <div className="shrink-0 xl:w-56">
              <p className="mb-2 text-xs font-medium text-slate-500">Puffer vor Anpfiff</p>
              <div className="flex gap-2">
                {PUFFER_OPTIONS.map((option) => {
                  const ankunft = calculateAnkunftszeit(trip.spiel_at, option.minutes)
                  return (
                    <button
                      key={option.minutes}
                      type="button"
                      onClick={() => setPufferMinuten(option.minutes)}
                      className={`flex flex-1 flex-col items-center rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        pufferMinuten === option.minutes
                          ? 'bg-hertha-blue text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{option.label}</span>
                      <span
                        className={`text-xs font-medium ${
                          pufferMinuten === option.minutes ? 'text-white/85' : 'text-slate-500'
                        }`}
                      >
                        Ankunft {formatUhrzeit(ankunft)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              {route.status === 'loading' ? (
                <p className="text-sm text-slate-500">Route wird berechnet …</p>
              ) : null}

              {route.status === 'no_key' ? (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Trage <code className="rounded bg-amber-100 px-1">VITE_GOOGLE_MAPS_API_KEY</code>{' '}
                  in die .env ein.
                </p>
              ) : null}

              {route.status === 'error' ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{route.message}</p>
              ) : null}

              {abfahrtszeit && route.status === 'ready' ? (
                <div className="rounded-xl bg-hertha-blue/10 px-4 py-3">
                  <p className="text-sm text-slate-600">
                    {isDefaultTreffpunkt(trip.treffpunkt_berlin)
                      ? HERTHA_TREFFPUNKT.departureHeading
                      : 'Empfohlene Abfahrt'}
                  </p>
                  <p className="text-4xl font-bold text-hertha-blue">
                    {formatUhrzeit(abfahrtszeit)} Uhr
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Anpfiff {formatAnpfiff(trip.spiel_at)} −{' '}
                    {formatDuration(route.plan.durationSeconds)} Fahrt −{' '}
                    {pufferMinuten === 90 ? '1,5' : '2'} Std. Puffer
                  </p>
                </div>
              ) : route.status !== 'loading' && route.status !== 'error' && route.status !== 'no_key' ? (
                <p className="text-sm text-slate-500">
                  Abfahrtszeit erscheint nach der Routenberechnung.
                </p>
              ) : null}

              {route.status === 'ready' ? (
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <p>
                    <span className="text-slate-500">Fahrtzeit </span>
                    <span className="font-semibold">{formatDuration(route.plan.durationSeconds)}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Distanz </span>
                    <span className="font-semibold">{formatDistance(route.plan.distanceMeters)}</span>
                  </p>
                  <p className="w-full text-slate-500">
                    {routeEndpoints?.originLabel} → {routeEndpoints?.destinationLabel}
                  </p>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-lg bg-hertha-mid px-4 py-2 text-sm font-semibold text-white transition hover:bg-hertha-blue"
                  >
                    Google Maps öffnen
                  </a>
                </div>
              ) : null}

              {abfahrtszeit ? (
                <HomeDepartureBlock
                  homeAddress={profile?.home_address}
                  treffpunktLabel={routeEndpoints?.originLabel ?? HERTHA_TREFFPUNKT.label}
                  treffpunktAbfahrt={abfahrtszeit}
                  homeOrigin={homeOrigin || homeAddress}
                  treffpunktDestination={routeEndpoints?.originResolved ?? routeEndpoints?.origin ?? ''}
                  routeStatus={homeRoute.status}
                  routePlan={homeRoute.status === 'ready' ? homeRoute.plan : undefined}
                  routeMessage={homeRoute.status === 'error' ? homeRoute.message : undefined}
                />
              ) : null}
            </div>
          </div>
        </DashboardSection>

        <DashboardSection title="Weitere Infos" compact className="lg:col-span-2">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Gegner</dt>
              <dd className="font-semibold">{trip.gegner}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Startpunkt</dt>
              <dd className="font-semibold">{trip.startpunkt}</dd>
            </div>
            {trip.notizen ? (
              <div>
                <dt className="text-slate-500">Notizen</dt>
                <dd className="font-medium">{trip.notizen}</dd>
              </div>
            ) : null}
          </dl>
        </DashboardSection>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <MitfahrerSection fahrtId={trip.id} currentUserId={user?.id} />
        <MitbringlisteSection fahrtId={trip.id} currentUserId={user?.id} />
      </div>

      <div className="mt-4">
        <ParkplatzSection
          stadion={trip.stadion}
          currentUserId={user?.id}
          parkplaetze={parkplaetze}
        />
      </div>
    </AppShell>
  )
}
