import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { MatchupWappen } from '../components/MatchupWappen'
import { MitfahrerAvatarStack } from '../components/MitfahrerAvatarStack'
import { useAuth } from '../contexts/AuthContext'
import { useAbfahrtAbstimmungOverview } from '../hooks/useAbfahrtAbstimmungOverview'
import { useFahrten } from '../hooks/useFahrten'
import { useMitbringliste } from '../hooks/useMitbringliste'
import { useMitfahrerOverview } from '../hooks/useMitfahrerOverview'
import { useParkplaetze } from '../hooks/useParkplaetze'
import { useProfile } from '../hooks/useProfile'
import { useRoutePlan } from '../hooks/useRoutePlan'
import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsPlaceUrl,
  calculateAbfahrtszeit,
  calculateAnkunftszeit,
  calculateHomeAbfahrtszeit,
  formatDistance,
  formatDuration,
} from '../lib/departureCalc'
import { formatAnpfiff, formatSpielDatum, formatUhrzeit } from '../lib/fahrtFormat'
import { getTreffpunktLabel, getTreffpunktMapsUrl } from '../lib/treffpunkt'
import {
  formatSpieltagDayLabel,
  nextTimelineItem,
  pickNextSpieltagFahrt,
  sortSpieltagTimeline,
  type SpieltagTimelineItem,
} from '../lib/spieltag'
import {
  departureTimeForHomeLeg,
  departureTimeForTraffic,
  getRouteEndpoints,
  qualifyBerlinAddress,
} from '../lib/routeAddresses'

const SPIELTAG_PUFFER_MINUTEN = 90

type QuickActionProps = {
  href: string
  label: string
  detail: string
  external?: boolean
  disabled?: boolean
}

function QuickAction({ href, label, detail, external = true, disabled = false }: QuickActionProps) {
  const className =
    'rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-left transition hover:bg-white/15'

  if (disabled) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left opacity-60">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="mt-1 text-xs text-white/65">{detail}</p>
      </div>
    )
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="mt-1 text-xs text-white/65">{detail}</p>
      </a>
    )
  }

  return (
    <Link to={href} className={className}>
      <p className="text-sm font-semibold text-white">{label}</p>
      <p className="mt-1 text-xs text-white/65">{detail}</p>
    </Link>
  )
}

function TimelineList({
  items,
  nextItem,
}: {
  items: SpieltagTimelineItem[]
  nextItem: SpieltagTimelineItem | null
}) {
  return (
    <ol className="space-y-3">
      {items.map((item) => {
        const active = item.id === nextItem?.id
        return (
          <li
            key={item.id}
            className={`rounded-2xl border px-4 py-3 ${
              active
                ? 'border-hertha-mid bg-hertha-mid/10'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                {item.detail ? <p className="mt-1 text-xs text-slate-500">{item.detail}</p> : null}
              </div>
              <p className="shrink-0 text-sm font-bold text-hertha-blue">{formatUhrzeit(item.time)} Uhr</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function SpieltagPage() {
  const now = new Date()
  const { user } = useAuth()
  const { profile } = useProfile(user?.id, user?.email)
  const { fahrten, loading, error } = useFahrten()
  const trip = useMemo(() => pickNextSpieltagFahrt(fahrten, now), [fahrten, now])
  const tripIds = useMemo(() => (trip ? [trip.id] : []), [trip])
  const { winningByFahrt } = useAbfahrtAbstimmungOverview(tripIds)
  const { byFahrt: mitfahrerByFahrt } = useMitfahrerOverview(tripIds)
  const mitbringliste = useMitbringliste(trip?.id)
  const parkplaetze = useParkplaetze(trip?.id)
  const selectedParkplatz = parkplaetze.entries.find((entry) => entry.is_selected) ?? null
  const routeEndpoints = trip ? getRouteEndpoints(trip, selectedParkplatz) : null
  const route = useRoutePlan(
    routeEndpoints?.origin ?? '',
    routeEndpoints?.destination ?? '',
    trip ? departureTimeForTraffic(trip.spiel_at, SPIELTAG_PUFFER_MINUTEN) : undefined,
  )

  const calculatedDeparture =
    trip && route.status === 'ready'
      ? calculateAbfahrtszeit(trip.spiel_at, route.plan.durationSeconds, SPIELTAG_PUFFER_MINUTEN)
      : null
  const winningDeparture = trip ? winningByFahrt.get(trip.id) : null
  const effectiveDeparture = winningDeparture?.time ?? calculatedDeparture
  const homeAddress = profile?.home_address?.trim() ?? ''
  const homeOrigin = homeAddress ? qualifyBerlinAddress(homeAddress) : ''
  const homeRoute = useRoutePlan(
    homeOrigin,
    routeEndpoints?.originResolved ?? '',
    effectiveDeparture ? departureTimeForHomeLeg(effectiveDeparture) : undefined,
  )
  const homeDeparture =
    effectiveDeparture && homeRoute.status === 'ready'
      ? calculateHomeAbfahrtszeit(effectiveDeparture, homeRoute.plan.durationSeconds)
      : null

  const timelineItems = useMemo(() => {
    if (!trip) return []

    const items: SpieltagTimelineItem[] = [
      {
        id: 'anpfiff',
        label: 'Anpfiff',
        time: new Date(trip.spiel_at),
        detail: trip.stadion,
      },
      {
        id: 'ankunft',
        label: 'Späteste Ankunft',
        time: calculateAnkunftszeit(trip.spiel_at, SPIELTAG_PUFFER_MINUTEN),
        detail: 'Mit 1,5 Stunden Puffer vor Anpfiff',
      },
    ]

    if (effectiveDeparture) {
      items.push({
        id: 'treffpunkt-abfahrt',
        label: 'Abfahrt am Treffpunkt',
        time: effectiveDeparture,
        detail: winningDeparture
          ? `${winningDeparture.count} von ${winningDeparture.totalVotes} Stimmen`
          : 'Aus aktueller Route berechnet',
        tone: 'primary',
      })
    }

    if (homeDeparture && homeRoute.status === 'ready') {
      items.push({
        id: 'zuhause-los',
        label: 'Zuhause los',
        time: homeDeparture,
        detail: `${formatDuration(homeRoute.plan.durationSeconds)} bis ${routeEndpoints?.originLabel ?? 'zum Treffpunkt'}`,
      })
    }

    return sortSpieltagTimeline(items)
  }, [effectiveDeparture, homeDeparture, homeRoute, routeEndpoints?.originLabel, trip, winningDeparture])

  const nextItem = useMemo(() => nextTimelineItem(timelineItems, now), [timelineItems, now])
  const mitfahrer = trip ? (mitfahrerByFahrt.get(trip.id) ?? []) : []
  const mitbringPreview = mitbringliste.entries.slice(0, 4)
  const routeUrl = routeEndpoints
    ? buildGoogleMapsDirectionsUrl(routeEndpoints.origin, routeEndpoints.destination)
    : '#'
  const parkplatzUrl = selectedParkplatz
    ? buildGoogleMapsPlaceUrl(
        selectedParkplatz.address,
        selectedParkplatz.place_id,
        selectedParkplatz.lat,
        selectedParkplatz.lng,
      )
    : '#'

  if (loading) {
    return (
      <AppShell title="Spieltag">
        <p className="text-center text-white/80">Spieltag wird geladen …</p>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell title="Spieltag">
        <p className="rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-100" role="alert">
          {error}
        </p>
      </AppShell>
    )
  }

  if (!trip) {
    return (
      <AppShell title="Spieltag">
        <div className="rounded-2xl border border-dashed border-white/30 bg-white/5 px-6 py-10 text-center">
          <p className="text-lg font-semibold">Keine kommende Auswärtsfahrt</p>
          <p className="mt-2 text-sm text-white/70">
            Lege die nächste Fahrt an, dann erscheint hier dein Spieltag-Dashboard.
          </p>
          <Link
            to="/fahrten/neu"
            className="mt-6 inline-block rounded-lg bg-white px-5 py-2.5 font-semibold text-hertha-blue transition hover:bg-white/90"
          >
            Fahrt anlegen
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Spieltag" wide>
      <div className="space-y-4">
        <section className="rounded-3xl bg-white p-5 text-slate-900 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-hertha-mid">
            {formatSpieltagDayLabel(trip.spiel_at, now)}
          </p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <MatchupWappen gegner={trip.gegner} size="md" />
              <p className="mt-3 text-sm text-slate-500">
                {formatSpielDatum(trip.spiel_at)}, {formatAnpfiff(trip.spiel_at)} Uhr
              </p>
              <h2 className="mt-1 text-3xl font-bold text-hertha-blue">{trip.gegner}</h2>
              <p className="mt-1 text-sm text-slate-600">{trip.stadion}</p>
            </div>
            <div className="rounded-2xl bg-hertha-blue px-5 py-4 text-white sm:min-w-64">
              <p className="text-sm text-white/75">
                {winningDeparture ? 'Abgestimmte Abfahrt' : 'Nächster wichtiger Zeitpunkt'}
              </p>
              <p className="mt-1 text-4xl font-bold">
                {nextItem ? formatUhrzeit(nextItem.time) : formatAnpfiff(trip.spiel_at)}
              </p>
              <p className="mt-1 text-sm text-white/80">
                {nextItem?.label ?? `Anpfiff um ${formatAnpfiff(trip.spiel_at)} Uhr`}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction href={routeUrl} label="Route öffnen" detail={routeEndpoints?.destinationLabel ?? trip.stadion} />
          <QuickAction
            href={getTreffpunktMapsUrl(trip)}
            label="Treffpunkt"
            detail={getTreffpunktLabel(trip)}
          />
          <QuickAction
            href={parkplatzUrl}
            label="Parkplatz"
            detail={selectedParkplatz?.name ?? 'Noch kein Parkplatz gewählt'}
            disabled={!selectedParkplatz}
          />
          <QuickAction
            href={`/fahrten/${trip.id}`}
            label="Dashboard"
            detail="Details bearbeiten"
            external={false}
          />
        </section>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl bg-white p-5 text-slate-900 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">Ablauf</h3>
                <p className="text-sm text-slate-500">Mobile Kurzfassung für den Fahrtag</p>
              </div>
              {route.status === 'ready' ? (
                <span className="rounded-full bg-hertha-blue/10 px-3 py-1 text-xs font-semibold text-hertha-blue">
                  {formatDuration(route.plan.durationSeconds)} · {formatDistance(route.plan.distanceMeters)}
                </span>
              ) : null}
            </div>

            {timelineItems.length > 0 ? (
              <TimelineList items={timelineItems} nextItem={nextItem} />
            ) : (
              <p className="text-sm text-slate-500">Der Ablauf erscheint, sobald die Fahrt geladen ist.</p>
            )}

            {route.status === 'loading' ? (
              <p className="mt-3 text-sm text-slate-500">Route wird berechnet …</p>
            ) : null}
            {route.status === 'no_key' ? (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Google Maps API-Key fehlt. Schnelllinks funktionieren trotzdem eingeschränkt.
              </p>
            ) : null}
            {route.status === 'error' ? (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {route.message}
              </p>
            ) : null}
          </section>

          <aside className="space-y-4">
            <section className="rounded-3xl bg-white p-5 text-slate-900 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">Mitfahrer</h3>
                  <p className="text-sm text-slate-500">{mitfahrer.length} dabei</p>
                </div>
                {mitfahrer.length > 0 ? <MitfahrerAvatarStack entries={mitfahrer} /> : null}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-5 text-slate-900 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">Mitbringliste</h3>
                  <p className="text-sm text-slate-500">
                    {mitbringliste.loading ? 'Wird geladen …' : `${mitbringliste.entries.length} Einträge`}
                  </p>
                </div>
                <Link to={`/fahrten/${trip.id}`} className="text-sm font-semibold text-hertha-mid hover:underline">
                  Öffnen
                </Link>
              </div>
              {mitbringPreview.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {mitbringPreview.map((entry) => (
                    <li key={entry.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      {entry.item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Noch nichts eingetragen.</p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  )
}
