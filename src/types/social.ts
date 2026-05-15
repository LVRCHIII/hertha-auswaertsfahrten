export type MitfahrerEintrag = {
  fahrt_id: string
  user_id: string
  created_at: string
  profile: { display_name: string; avatar_url: string | null } | null
}

export type MitbringEintrag = {
  id: string
  fahrt_id: string
  user_id: string
  item: string
  created_at: string
  profile: { display_name: string; avatar_url: string | null } | null
}
