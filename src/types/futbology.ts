export type FutbologySpiel = {
  id: string
  user_id: string
  datum: string
  stadion: string
  heim_team: string
  gast_team: string
  ergebnis: string | null
  liga: string | null
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
