import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { DashboardSection } from '../components/DashboardSection'
import { MatchupWappen } from '../components/MatchupWappen'
import { AbfahrtAbstimmungBlock } from '../components/AbfahrtAbstimmungBlock'
import { HomeDepartureBlock } from '../components/HomeDepartureBlock'
import { RouteMap } from '../components/RouteMap'
import { MitbringlisteSection } from '../components/MitbringlisteSection'
import { MitfahrerSection } from '../components/MitfahrerSection'
import { ParkplatzSection } from '../components/ParkplatzSection'
import { SpieltagsberichtSection } from '../components/SpieltagsberichtSection'
import { FahrtFotoGalerie } from '../components/FahrtFotoGalerie'
import { useAuth } from '../contexts/AuthContext'
import { useFahrt } from '../hooks/useFahrt'
import { useProfile } from '../hooks/useProfile'
import { deleteFahrt, updateFahrtRouteDistance } from '../lib/fahrtenApi'
import { getTreffpunktLabel, getTreffpunktMapsUrl } from '../lib/treffpunkt'
import { useAbfahrtAbstimmung } from '../hooks/useAbfahrtAbstimmung'
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
  const abstimmung = useAbfahrtAbstimmung(id, user?.id)
  const parkplaetze = useParkplaetze(id)
  const selectedParkplatz = parkplaetze.entries.find((entry) => entry.is_selected) ?? null
  const [pufferMinuten, setPufferMinuten] = useState(90)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [routeDistanceError, setRouteDistanceError] = useState<string | null>(null)
  const routeEndpoints = fahrt ? getRouteEndpoints(fahrt, selectedParkplatz) : null
  const routeDepartureTime = useMemo(
    () => (fahrt ? departureTimeForTraffic(fahrt.spiel_at, pufferMinuten) : undefined),
    [fahrt?.spiel_at, pufferMinuten],
  )
  const route = useRoutePlan(
    routeEndpoints?.origin ?? '',
    routeEndpoints?.destination ?? '',
    routeDepartureTime,
  )
  const routeDistanceMeters = route.status === 'ready' ? route.plan.distanceMeters : null

  useEffect(() => {
    if (!fahrt || routeDistanceMeters == null) return

    const roundedDistance = Math.round(routeDistanceMeters)
    if (fahrt.route_distance_meters === roundedDistance) return

    let cancelled = false
    setRouteDistanceError(null)

    updateFahrtRouteDistance(fahrt.id, roundedDistance).then((result) => {
      if (cancelled) return
      setRouteDistanceError(result.error)
    })

    return () => {
      cancelled = true
    }
  }, [fahrt?.id, fahrt?.route_distance_meters, routeDistanceMeters])

  const abfahrtszeit =
    fahrt && route.status === 'ready'
      ? calculateAbfahrtszeit(fahrt.spiel_at, route.plan.durationSeconds, pufferMinuten)
      : null

  const effectiveAbfahrt = abstimmung.winning?.time ?? abfahrtszeit

  const homeAddress = profile?.home_address?.trim() ?? ''
  const homeOrigin = homeAddress ? qualifyBerlinAddress(homeAddress) : ''
  const homeDepartureTime = useMemo(
    () => (effectiveAbfahrt ? departureTimeForHomeLeg(effectiveAbfahrt) : undefined),
    [effectiveAbfahrt?.getTime()],
  )
  const homeRoute = useRoutePlan(
    homeOrigin,
    routeEndpoints?.originResolved ?? '',
    homeDepartureTime,
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
        <p className="rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-100" role="alert">
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
      {/* Hero-Header */}
      <div className="glass-card noise-overlay relative mb-4 overflow-hidden rounded-3xl">
        <div className="accent-line h-1" />
        <div
          aria-hidden
          className="font-display pointer-events-none absolute -right-3 -bottom-5 select-none text-[7rem] leading-none text-shell-fg/[0.05] sm:text-[9rem]"
        >
          {trip.gegner.split(' ').pop()}
        </div>

        <div className="relative flex items-center justify-between gap-3 px-5 pt-4">
          <Link to="/" className="text-sm font-medium text-shell-fg/50 transition hover:text-shell-fg">
            ← Alle Fahrten
          </Link>
          {canDelete ? (
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={deleting}
              className="text-sm font-medium text-red-300/70 transition hover:text-red-300 disabled:opacity-60"
            >
              {deleting ? 'Wird gelöscht …' : 'Fahrt löschen'}
            </button>
          ) : null}
        </div>

        {deleteError ? (
          <p className="relative mx-5 mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200" role="alert">
            {deleteError}
          </p>
        ) : null}

        <div className="relative px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
          <MatchupWappen gegner={trip.gegner} size="md" />
          <h2 className="font-display mt-4 text-3xl leading-[0.95] text-shell-fg sm:text-4xl">{trip.gegner}</h2>

          <dl className="mt-5 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-display-wide text-[9px] text-shell-fg/40">Anpfiff</dt>
              <dd className="mt-1 font-semibold text-shell-fg">
                {formatSpielDatum(trip.spiel_at)}, {formatAnpfiff(trip.spiel_at)} Uhr
              </dd>
            </div>
            <div>
              <dt className="font-display-wide text-[9px] text-shell-fg/40">Stadion</dt>
              <dd className="mt-1 font-semibold text-shell-fg">{trip.stadion}</dd>
            </div>
            <div>
              <dt className="font-display-wide text-[9px] text-shell-fg/40">Treffpunkt</dt>
              <dd className="mt-1 font-semibold text-shell-fg">
                {getTreffpunktLabel(trip)}
                <a
                  href={getTreffpunktMapsUrl(trip)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-xs font-medium text-shell-fg/60 underline underline-offset-2 hover:text-shell-fg"
                >
                  Karte
                </a>
              </dd>
            </div>
          </dl>

          {trip.notizen ? (
            <p className="mt-4 rounded-lg border border-shell-fg/10 bg-shell-fg/5 px-3 py-2 text-sm text-shell-fg/75">
              <span className="font-medium text-shell-fg/50">Notizen · </span>
              {trip.notizen}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <DashboardSection title="Abfahrt" compact>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="shrink-0 sm:w-56">
              <p className="mb-2 text-xs font-medium text-shell-fg/55">Puffer vor Anpfiff</p>
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
                          ? 'bg-shell-cta-bg text-shell-cta-fg'
                          : 'bg-shell-fg/10 text-shell-fg/80 hover:bg-shell-fg/15'
                      }`}
                    >
                      <span>{option.label}</span>
                      <span
                        className={`text-xs font-medium ${
                          pufferMinuten === option.minutes ? 'text-white/85' : 'text-shell-fg/55'
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
                <p className="text-sm text-shell-fg/55">Route wird berechnet …</p>
              ) : null}

              {route.status === 'no_key' ? (
                <p className="rounded-lg bg-amber-400/15 px-3 py-2 text-sm text-amber-200">
                  Trage <code className="rounded bg-amber-400/25 px-1">VITE_GOOGLE_MAPS_API_KEY</code>{' '}
                  in die .env ein.
                </p>
              ) : null}

              {route.status === 'error' ? (
                <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{route.message}</p>
              ) : null}

              {abfahrtszeit && route.status === 'ready' ? (
                <>
                  <div className="rounded-xl bg-shell-cta-bg/15 px-4 py-3">
                    <p className="text-sm text-shell-fg/70">
                      {abstimmung.winning
                        ? 'Abgestimmte Abfahrt am Treffpunkt'
                        : isDefaultTreffpunkt(trip.treffpunkt_berlin)
                          ? HERTHA_TREFFPUNKT.departureHeading
                          : 'Empfohlene Abfahrt am Treffpunkt'}
                    </p>
                    <p className="text-4xl font-bold text-shell-fg">
                      {formatUhrzeit(effectiveAbfahrt!)} Uhr
                    </p>
                    <p className="mt-1 text-xs text-shell-fg/55">
                      {abstimmung.winning ? (
                        <>
                          {abstimmung.winning.count} von {abstimmung.winning.totalVotes} Stimmen
                          {abfahrtszeit.getTime() !== effectiveAbfahrt!.getTime()
                            ? ` · berechnet ${formatUhrzeit(abfahrtszeit)}`
                            : null}
                        </>
                      ) : (
                        <>
                          Anpfiff {formatAnpfiff(trip.spiel_at)} −{' '}
                          {formatDuration(route.plan.durationSeconds)} Fahrt −{' '}
                          {pufferMinuten === 90 ? '1,5' : '2'} Std. Puffer
                        </>
                      )}
                    </p>
                  </div>
                  <AbfahrtAbstimmungBlock
                    empfohleneAbfahrt={abfahrtszeit}
                    currentUserId={user?.id}
                    votes={abstimmung.votes}
                    winning={abstimmung.winning}
                    loading={abstimmung.loading}
                    error={abstimmung.error}
                    actionError={abstimmung.actionError}
                    busy={abstimmung.busy}
                    onVote={(slot) => void abstimmung.vote(slot)}
                    hasMyVoteForSlot={abstimmung.hasMyVoteForSlot}
                  />
                </>
              ) : route.status !== 'loading' && route.status !== 'error' && route.status !== 'no_key' ? (
                <p className="text-sm text-shell-fg/55">
                  Abfahrtszeit erscheint nach der Routenberechnung.
                </p>
              ) : null}

            </div>
          </div>
        </DashboardSection>

        {route.status === 'ready' ? (
          <DashboardSection title="Route" compact>
            {routeEndpoints?.destinationViaParkplatz ? (
              <p className="mb-3 rounded-lg bg-shell-cta-bg/15 px-3 py-2 text-sm text-shell-fg">
                Routenziel: gewählter Parkplatz „{routeEndpoints.destinationLabel}“
              </p>
            ) : null}

            <RouteMap directions={route.plan.directions} className="mb-4" />

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <p>
                <span className="text-shell-fg/55">Fahrtzeit </span>
                <span className="font-semibold">{formatDuration(route.plan.durationSeconds)}</span>
              </p>
              <p>
                <span className="text-shell-fg/55">Distanz </span>
                <span className="font-semibold">{formatDistance(route.plan.distanceMeters)}</span>
              </p>
              {routeDistanceError ? (
                <p className="w-full rounded-lg bg-amber-400/15 px-3 py-2 text-sm text-amber-200">
                  Distanz für Statistik konnte nicht gespeichert werden: {routeDistanceError}
                </p>
              ) : null}
              <p className="w-full text-shell-fg/55">
                {routeEndpoints?.originLabel} → {routeEndpoints?.destinationLabel}
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-lg bg-shell-cta-bg px-4 py-2 text-sm font-semibold text-shell-cta-fg transition hover:opacity-90"
              >
                In Google Maps öffnen
              </a>
            </div>

            {effectiveAbfahrt ? (
              <HomeDepartureBlock
                homeAddress={profile?.home_address}
                treffpunktLabel={routeEndpoints?.originLabel ?? HERTHA_TREFFPUNKT.label}
                treffpunktAbfahrt={effectiveAbfahrt}
                homeOrigin={homeOrigin || homeAddress}
                treffpunktDestination={routeEndpoints?.originResolved ?? routeEndpoints?.origin ?? ''}
                routeStatus={homeRoute.status}
                routePlan={homeRoute.status === 'ready' ? homeRoute.plan : undefined}
                routeMessage={homeRoute.status === 'error' ? homeRoute.message : undefined}
              />
            ) : null}
          </DashboardSection>
        ) : null}

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

      <div className="mt-4">
        <SpieltagsberichtSection
          fahrtId={trip.id}
          currentUserId={user?.id}
          gegner={trip.gegner}
        />
      </div>

      <div className="mt-4">
        <FahrtFotoGalerie fahrtId={trip.id} currentUserId={user?.id} />
      </div>
    </AppShell>
  )
}
