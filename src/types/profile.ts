export type Profile = {
  id: string
  display_name: string
  avatar_url: string | null
  home_address: string | null
  created_at: string
  updated_at: string
}

export type ProfileUpdate = {
  display_name: string
  home_address: string | null
}
