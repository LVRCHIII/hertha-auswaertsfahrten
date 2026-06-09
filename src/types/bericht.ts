import type { JSONContent } from '@tiptap/core'

export type Spieltagsbericht = {
  fahrt_id: string
  author_id: string
  content_json: JSONContent
  content_text: string | null
  created_at: string
  updated_at: string
  author: {
    display_name: string
    avatar_url: string | null
  } | null
  ergebnis_heim: number | null
  ergebnis_gast: number | null
  zuschauer: number | null
  bewertung_spiel: number | null
  bewertung_atmosphaere: number | null
  bewertung_pommes: number | null
}

export type BerichtMeta = {
  ergebnis_heim: number | null
  ergebnis_gast: number | null
  zuschauer: number | null
  bewertung_spiel: number | null
  bewertung_atmosphaere: number | null
  bewertung_pommes: number | null
}
