import type { FotoArchivFahrt } from './fotoArchivApi'

const searchDateFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export type FotoArchivFilters = {
  query: string
  from: string
  to: string
}

function normalizeSearchValue(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('de-DE')
    .trim()
}

export function localDateKey(isoDate: string): string {
  const date = new Date(isoDate)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function filterFotoArchivFahrten(
  fahrten: FotoArchivFahrt[],
  { query, from, to }: FotoArchivFilters,
): FotoArchivFahrt[] {
  const terms = normalizeSearchValue(query).split(/\s+/).filter(Boolean)

  return fahrten.filter((fahrt) => {
    const dateKey = localDateKey(fahrt.spiel_at)
    if (from && dateKey < from) return false
    if (to && dateKey > to) return false

    if (terms.length === 0) return true

    const formattedDate = searchDateFormatter.format(new Date(fahrt.spiel_at))
    const haystack = normalizeSearchValue(
      `${fahrt.gegner} ${fahrt.stadion} ${dateKey} ${formattedDate}`,
    )

    return terms.every((term) => haystack.includes(term))
  })
}
