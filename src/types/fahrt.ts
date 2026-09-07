export type FahrtTyp = 'auswaerts' | 'heim'

export type Fahrt = {
  id: string
  created_at: string
  created_by: string
  openliga_match_id: number | null
  typ: FahrtTyp
  gegner: string
  stadion: string
  spiel_at: string
  startpunkt: string
  notizen: string | null
  treffpunkt_berlin: string | null
  treffpunkt_bestaetigt: boolean
  route_distance_meters: number | null
}

export type FahrtInsert = {
  gegner: string
  stadion: string
  spiel_at: string
  startpunkt: string
  typ?: FahrtTyp
  notizen?: string | null
  treffpunkt_berlin?: string | null
  treffpunkt_bestaetigt?: boolean
  created_by: string
  openliga_match_id?: number | null
}
