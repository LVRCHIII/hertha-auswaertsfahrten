import { formatDistance } from '../lib/departureCalc'
import {
  parkingCostBadgeClass,
  parkingCostLabel,
  type ParkingCostKind,
} from '../lib/parkingInfo'

type ParkingMetaProps = {
  distanceMeters: number | null | undefined
  costKind: ParkingCostKind | null | undefined
  className?: string
}

export function ParkingMeta({ distanceMeters, costKind, className = '' }: ParkingMetaProps) {
  const hasDistance = distanceMeters != null && distanceMeters > 0
  const hasCost = costKind != null

  if (!hasDistance && !hasCost) {
    return null
  }

  return (
    <div className={`mt-1 flex flex-wrap items-center gap-1.5 ${className}`}>
      {hasDistance ? (
        <span className="rounded-full bg-shell-cta-bg/15 px-2 py-0.5 text-xs font-medium text-shell-fg">
          {formatDistance(distanceMeters)} vom Stadion
        </span>
      ) : null}
      {hasCost ? (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${parkingCostBadgeClass(costKind)}`}
        >
          {parkingCostLabel(costKind)}
        </span>
      ) : null}
    </div>
  )
}
