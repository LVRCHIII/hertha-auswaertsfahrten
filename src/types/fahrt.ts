export type Fahrt = {
  id: string
  created_at: string
  created_by: string
  gegner: string
  stadion: string
  spiel_at: string
  startpunkt: string
  notizen: string | null
  treffpunkt_berlin: string | null
}

export type FahrtInsert = {
  gegner: string
  stadion: string
  spiel_at: string
  startpunkt: string
  notizen?: string | null
  treffpunkt_berlin?: string | null
  created_by: string
}
