import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { DashboardSection } from '../components/DashboardSection'
import { useFahrt } from '../hooks/useFahrt'
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
import { departureTimeForTraffic, getRouteEndpoints } from '../lib/routeAddresses'

const PUFFER_OPTIONS = [
  { label: '1,5 Std.', minutes: 90 },
  { label: '2 Std.', minutes: 120 },
] as const

export function FahrtDashboardPage() {
  const { id } = useParams<{ id: string }>()
  const { fahrt, loading, error } = useFahrt(id)
  const [pufferMinuten, setPufferMinuten] = useState(90)

  const routeEndpoints = fahrt ? getRouteEndpoints(fahrt) : null
  const route = useRoutePlan(
    routeEndpoints?.origin ?? '',
    routeEndpoints?.destination ?? '',
    fahrt ? departureTimeForTraffic(fahrt.spiel_at, pufferMinuten) : undefined,
  )

  const abfahrtszeit =
    fahrt && route.status === 'ready'
      ? calculateAbfahrtszeit(fahrt.spiel_at, route.plan.durationSeconds, pufferMinuten)
      : null

  if (loading) {
    return (
      <AppShell title="Fahrt laden …">
        <p className="text-center text-white/80">Wird geladen …</p>
      </AppShell>
    )
  }

  if (error || !fahrt) {
    return (
      <AppShell title="Fahrt">
        <p className="rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-100" role="alert">
          {error ?? 'Fahrt nicht gefunden.'}
        </p>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-white underline">
          ← Zurück zur Übersicht
        </Link>
      </AppShell>
    )
  }

  const mapsUrl = routeEndpoints
    ? buildGoogleMapsDirectionsUrl(routeEndpoints.origin, routeEndpoints.destination)
    : '#'

  return (
    <AppShell title={fahrt.gegner}>
      <Link to="/" className="mb-4 inline-block text-sm font-medium text-white/80 hover:text-white">
        ← Alle Fahrten
      </Link>

      <div className="space-y-4">
        <DashboardSection title="Spielinfo">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Gegner</dt>
              <dd className="font-semibold">{fahrt.gegner}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Anpfiff</dt>
              <dd className="font-semibold">
                {formatSpielDatum(fahrt.spiel_at)}, {formatAnpfiff(fahrt.spiel_at)} Uhr
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Stadion / Ziel</dt>
              <dd className="font-semibold">{fahrt.stadion}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Startpunkt</dt>
              <dd className="font-semibold">{fahrt.startpunkt}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Treffpunkt</dt>
              <dd className="font-semibold">
                {routeEndpoints?.originLabel ?? HERTHA_TREFFPUNKT.label}
                <a
                  href={HERTHA_TREFFPUNKT.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-sm font-medium text-hertha-mid hover:underline"
                >
                  Karte
                </a>
              </dd>
            </div>
            {fahrt.notizen ? (
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Notizen</dt>
                <dd className="font-medium">{fahrt.notizen}</dd>
              </div>
            ) : null}
          </dl>
        </DashboardSection>

        <DashboardSection title="Zeitplanung">
          <p className="mb-3 text-sm text-slate-600">
            Puffer vor Anpfiff (Einlass, Anfahrt zum Stadion):
          </p>
          <div className="mb-4 flex gap-2">
            {PUFFER_OPTIONS.map((option) => {
              const ankunft = calculateAnkunftszeit(fahrt.spiel_at, option.minutes)
              return (
                <button
                  key={option.minutes}
                  type="button"
                  onClick={() => setPufferMinuten(option.minutes)}
                  className={`flex flex-col items-center rounded-lg px-4 py-2 text-sm font-semibold transition ${
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
                    Ankunft {formatUhrzeit(ankunft)} Uhr
                  </span>
                </button>
              )
            })}
          </div>

          {route.status === 'loading' ? (
            <p className="text-sm text-slate-500">Route wird berechnet …</p>
          ) : null}

          {route.status === 'no_key' ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Trage <code className="rounded bg-amber-100 px-1">VITE_GOOGLE_MAPS_API_KEY</code> in
              die .env ein, um die Abfahrtszeit zu berechnen.
            </p>
          ) : null}

          {route.status === 'error' ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{route.message}</p>
          ) : null}

          {abfahrtszeit && route.status === 'ready' ? (
            <div className="rounded-xl bg-hertha-blue/10 px-4 py-4">
              <p className="text-sm text-slate-600">
                {isDefaultTreffpunkt(fahrt.treffpunkt_berlin)
                  ? HERTHA_TREFFPUNKT.departureHeading
                  : 'Empfohlene Abfahrt'}
              </p>
              <p className="mt-1 text-3xl font-bold text-hertha-blue">
                {formatUhrzeit(abfahrtszeit)} Uhr
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Anpfiff {formatAnpfiff(fahrt.spiel_at)} − {formatDuration(route.plan.durationSeconds)}{' '}
                Fahrt − {pufferMinuten === 90 ? '1,5' : '2'} Std. Puffer
              </p>
            </div>
          ) : route.status === 'ready' ? null : (
            <p className="text-sm text-slate-500">
              Abfahrtszeit wird angezeigt, sobald die Route berechnet ist.
            </p>
          )}
        </DashboardSection>

        <DashboardSection title="Route & Fahrtzeit">
          {route.status === 'ready' ? (
            <div className="space-y-3 text-sm">
              <p>
                <span className="text-slate-500">Fahrtzeit: </span>
                <span className="font-semibold">{formatDuration(route.plan.durationSeconds)}</span>
              </p>
              <p>
                <span className="text-slate-500">Distanz: </span>
                <span className="font-semibold">{formatDistance(route.plan.distanceMeters)}</span>
              </p>
              <p className="text-slate-500">
                {routeEndpoints?.originLabel} → {routeEndpoints?.destinationLabel}
              </p>
              {routeEndpoints &&
              routeEndpoints.originResolved !== routeEndpoints.originLabel ? (
                <p className="text-xs text-slate-400">
                  Berechnet für: {routeEndpoints.originResolved} → {routeEndpoints.destination}
                </p>
              ) : null}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-lg bg-hertha-mid px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-hertha-blue"
              >
                Route in Google Maps öffnen
              </a>
            </div>
          ) : route.status === 'loading' ? (
            <p className="text-sm text-slate-500">Route wird geladen …</p>
          ) : (
            <p className="text-sm text-slate-500">
              Routendetails erscheinen nach erfolgreicher Berechnung.
            </p>
          )}
        </DashboardSection>

        <DashboardSection title="Parkplatz" badge="Milestone 4">
          <p className="text-sm text-slate-500">
            Automatische Parkplatzsuche folgt in einem späteren Schritt.
          </p>
        </DashboardSection>

        <DashboardSection title="Mitfahrer" badge="Milestone 3">
          <p className="text-sm text-slate-500">Anmelden und Mitfahrerliste folgen bald.</p>
        </DashboardSection>

        <DashboardSection title="Mitbringliste" badge="Milestone 3">
          <p className="text-sm text-slate-500">Gemeinsame Mitbringliste folgt bald.</p>
        </DashboardSection>
      </div>
    </AppShell>
  )
}
