import type { ParkingCostKind } from '../lib/parkingInfo'

export type ParkplatzSource = 'google' | 'manual'

export type Parkplatz = {
  id: string
  fahrt_id: string
  name: string
  address: string
  place_id: string | null
  lat: number | null
  lng: number | null
  distance_meters: number | null
  cost_kind: ParkingCostKind | null
  source: ParkplatzSource
  is_selected: boolean
  created_by: string
  created_at: string
}

export type ParkingSuggestion = {
  name: string
  address: string
  placeId: string | null
  lat: number
  lng: number
  distanceMeters: number
  costKind: ParkingCostKind
}

export type ParkplatzInsert = {
  fahrt_id: string
  name: string
  address: string
  place_id?: string | null
  lat?: number | null
  lng?: number | null
  distance_meters?: number | null
  cost_kind?: ParkingCostKind | null
  source: ParkplatzSource
  created_by: string
}
