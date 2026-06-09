export type FutbologySpiel = {
  id: string
  user_id: string
  datum: string
  stadion: string
  heim_team: string
  gast_team: string
  ergebnis: string | null
  liga: string | null
  source: 'csv' | 'manual'
  created_at: string
  profile?: { display_name: string; avatar_url: string | null } | null
}

export type FutbologyAttendee = {
  user_id: string
  display_name: string
  avatar_url: string | null
}

export type GroupedSpiel = {
  datum: string
  stadion: string
  heim_team: string
  gast_team: string
  ergebnis: string | null
  liga: string | null
  attendees: FutbologyAttendee[]
  /** IDs aller Einträge für diese Begegnung (zum Löschen) */
  ids: { id: string; user_id: string; source: 'csv' | 'manual' }[]
}

export type SpielKategorie = 'alle' | 'auswaerts' | 'heim' | 'andere'

export type ParsedCsvRow = {
  datum: string
  stadion: string
  heim_team: string
  gast_team: string
  ergebnis: string | null
  liga: string | null
}
