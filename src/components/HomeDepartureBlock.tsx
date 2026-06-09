import { Link } from 'react-router-dom'
import {
  buildGoogleMapsDirectionsUrl,
  calculateHomeAbfahrtszeit,
  formatDuration,
} from '../lib/departureCalc'
import { formatUhrzeit } from '../lib/fahrtFormat'
import type { RoutePlan } from '../hooks/useRoutePlan'
import type { RouteLocation } from '../lib/routeAddresses'

type HomeDepartureBlockProps = {
  homeAddress: string | null | undefined
  treffpunktLabel: string
  treffpunktAbfahrt: Date
  homeOrigin: RouteLocation
  treffpunktDestination: RouteLocation | string
  routeStatus: 'idle' | 'no_key' | 'loading' | 'ready' | 'error'
  routePlan?: RoutePlan
  routeMessage?: string
}

export function HomeDepartureBlock({
  homeAddress,
  treffpunktLabel,
  treffpunktAbfahrt,
  homeOrigin,
  treffpunktDestination,
  routeStatus,
  routePlan,
  routeMessage,
}: HomeDepartureBlockProps) {
  const hasHome = Boolean(homeAddress?.trim())

  if (!hasHome) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-sm font-medium text-slate-700">Deine Abfahrt von zu Hause</p>
        <p className="mt-1 text-sm text-slate-500">
          Trage im{' '}
          <Link to="/profil" className="font-semibold text-card-accent hover:underline">
            Profil
          </Link>{' '}
          ein, von wo du losfährst — dann siehst du hier, wann du Zuhause los musst, um rechtzeitig
          am Treffpunkt ({formatUhrzeit(treffpunktAbfahrt)} Uhr) zu sein.
        </p>
      </div>
    )
  }

  const homeAbfahrt =
    routeStatus === 'ready' && routePlan
      ? calculateHomeAbfahrtszeit(treffpunktAbfahrt, routePlan.durationSeconds)
      : null

  const mapsUrl = buildGoogleMapsDirectionsUrl(homeOrigin, treffpunktDestination)

  return (
    <div className="mt-4 rounded-xl border border-card-accent/25 bg-card-accent/5 px-4 py-3">
      <p className="text-sm font-medium text-slate-700">Deine Abfahrt von zu Hause</p>
      <p className="mt-0.5 text-xs text-slate-500">
        Treffpunkt {treffpunktLabel} · Abfahrt dort {formatUhrzeit(treffpunktAbfahrt)} Uhr
      </p>

      {routeStatus === 'loading' ? (
        <p className="mt-2 text-sm text-slate-500">Route von Zuhause wird berechnet …</p>
      ) : null}

      {routeStatus === 'error' ? (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{routeMessage}</p>
      ) : null}

      {homeAbfahrt ? (
        <>
          <p className="mt-2 text-3xl font-bold text-card-accent">{formatUhrzeit(homeAbfahrt)} Uhr</p>
          <p className="mt-1 text-xs text-slate-500">
            {formatDuration(routePlan!.durationSeconds)} Fahrt bis {treffpunktLabel}
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex rounded-lg border border-card-accent/40 px-3 py-1.5 text-sm font-semibold text-card-accent transition hover:bg-card-accent/10"
          >
            Route Zuhause → Treffpunkt
          </a>
        </>
      ) : routeStatus !== 'loading' && routeStatus !== 'error' ? (
        <p className="mt-2 text-sm text-slate-500">Abfahrtszeit erscheint nach der Routenberechnung.</p>
      ) : null}
    </div>
  )
}
