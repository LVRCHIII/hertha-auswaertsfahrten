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
  treffpunkt_bestaetigt: boolean
}

export type FahrtInsert = {
  gegner: string
  stadion: string
  spiel_at: string
  startpunkt: string
  notizen?: string | null
  treffpunkt_berlin?: string | null
  treffpunkt_bestaetigt?: boolean
  created_by: string
}
