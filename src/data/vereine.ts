/** 2. Bundesliga — aktuelle Saison (Stand Tabelle 2025/26). */
export type Verein = {
  name: string
  stadion: string
  wappenUrl: string
  /** Zusätzliche Suchbegriffe (Kurzname, Stadt, Spitzname) */
  suchbegriffe: string[]
}

const wappen = (slug: string) => `/wappen/${slug}.png`

export const HERTHA_WAPPEN_URL = wappen('hertha')

/** Alle Vereine der 2. Bundesliga Saison 2025/26 (alphabetisch). */
export const VEREINE_2_BUNDESLIGA: Verein[] = [
  {
    name: '1. FC Kaiserslautern',
    stadion: 'Fritz-Walter-Stadion, Kaiserslautern',
    wappenUrl: wappen('kaiserslautern'),
    suchbegriffe: ['FCK', 'Lautern', 'Kaiserslautern', 'Roten Teufel'],
  },
  {
    name: '1. FC Magdeburg',
    stadion: 'MDCC-Arena, Magdeburg',
    wappenUrl: wappen('magdeburg'),
    suchbegriffe: ['FCM', 'Magdeburg'],
  },
  {
    name: '1. FC Nürnberg',
    stadion: 'Max-Morlock-Stadion, Nürnberg',
    wappenUrl: wappen('nuernberg'),
    suchbegriffe: ['FCN', 'Nürnberg', 'Nuernberg', 'Club'],
  },
  {
    name: 'Arminia Bielefeld',
    stadion: 'SchücoArena, Bielefeld',
    wappenUrl: wappen('arminia-bielefeld'),
    suchbegriffe: ['DSC', 'Bielefeld', 'Arminia'],
  },
  {
    name: 'Dynamo Dresden',
    stadion: 'Rudolf-Harbig-Stadion, Dresden',
    wappenUrl: wappen('dynamo-dresden'),
    suchbegriffe: ['SGD', 'Dresden', 'Dynamo'],
  },
  {
    name: 'Eintracht Braunschweig',
    stadion: 'Eintracht-Stadion, Braunschweig',
    wappenUrl: wappen('braunschweig'),
    suchbegriffe: ['BTSV', 'Braunschweig', 'Löwen'],
  },
  {
    name: 'FC Schalke 04',
    stadion: 'VELTINS-Arena, Gelsenkirchen',
    wappenUrl: wappen('schalke'),
    suchbegriffe: ['Schalke', 'S04', 'Knappen', 'Gelsenkirchen'],
  },
  {
    name: 'Fortuna Düsseldorf',
    stadion: 'Merkur Spiel-Arena, Düsseldorf',
    wappenUrl: wappen('fortuna-duesseldorf'),
    suchbegriffe: ['F95', 'Düsseldorf', 'Duesseldorf', 'Fortuna'],
  },
  {
    name: 'Hannover 96',
    stadion: 'Heinz von Heiden Arena, Hannover',
    wappenUrl: wappen('hannover'),
    suchbegriffe: ['H96', 'Hannover', '96'],
  },
  {
    name: 'Hertha BSC',
    stadion: 'Olympiastadion Berlin',
    wappenUrl: wappen('hertha'),
    suchbegriffe: ['Hertha', 'BSC', 'Berlin', 'Alte Dame'],
  },
  {
    name: 'Holstein Kiel',
    stadion: 'Holstein-Stadion, Kiel',
    wappenUrl: wappen('holstein-kiel'),
    suchbegriffe: ['Kiel', 'Störche', 'Holstein'],
  },
  {
    name: 'Karlsruher SC',
    stadion: 'BBBank Wildpark, Karlsruhe',
    wappenUrl: wappen('karlsruhe'),
    suchbegriffe: ['KSC', 'Karlsruhe'],
  },
  {
    name: 'SC Paderborn 07',
    stadion: 'Home Deluxe Arena, Paderborn',
    wappenUrl: wappen('paderborn'),
    suchbegriffe: ['SCP', 'Paderborn', '07'],
  },
  {
    name: 'SC Preußen Münster',
    stadion: 'Preußenstadion, Münster',
    wappenUrl: wappen('preussen-muenster'),
    suchbegriffe: ['Preußen', 'Preussen', 'Münster', 'Muenster', 'SCPM'],
  },
  {
    name: 'SpVgg Greuther Fürth',
    stadion: 'Sportpark Ronhof Thomas Sommer, Fürth',
    wappenUrl: wappen('greuther-fuerth'),
    suchbegriffe: ['Fürth', 'Fuerth', 'Kleeblätter', 'Kleeblatt', 'Greuther'],
  },
  {
    name: 'SV 07 Elversberg',
    stadion: 'URSAPHARM-Arena an der Kaiserlinde, Spiesen-Elversberg',
    wappenUrl: wappen('elversberg'),
    suchbegriffe: ['Elversberg', '07', 'Saarland'],
  },
  {
    name: 'SV Darmstadt 98',
    stadion: 'Merck-Stadion am Böllenfalltor, Darmstadt',
    wappenUrl: wappen('darmstadt'),
    suchbegriffe: ['Lilien', 'Darmstadt', '98', 'SVD'],
  },
  {
    name: 'VfL Bochum',
    stadion: 'Vonovia Ruhrstadion, Bochum',
    wappenUrl: wappen('bochum'),
    suchbegriffe: ['Bochum', 'VfL', 'Unabsteigbar'],
  },
]

export function filterVereine(query: string): Verein[] {
  const q = query.trim().toLowerCase()
  if (!q) return VEREINE_2_BUNDESLIGA

  return VEREINE_2_BUNDESLIGA.filter((verein) => {
    const haystack = [verein.name, verein.stadion, ...verein.suchbegriffe]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

export function findVereinByName(name: string): Verein | undefined {
  const trimmed = name.trim()
  return VEREINE_2_BUNDESLIGA.find((v) => v.name === trimmed)
}

/** Wappen-URL für einen Gegnernamen (exakt oder über Suchbegriffe). */
export function resolveGegnerWappen(gegner: string): string | null {
  const trimmed = gegner.trim()
  if (!trimmed) return null

  const exact = findVereinByName(trimmed)
  if (exact) return exact.wappenUrl

  const q = trimmed.toLowerCase()
  const match = VEREINE_2_BUNDESLIGA.find((verein) => {
    const name = verein.name.toLowerCase()
    if (name.includes(q) || q.includes(name)) return true
    return verein.suchbegriffe.some(
      (term) => term.toLowerCase() === q || q.includes(term.toLowerCase()),
    )
  })

  return match?.wappenUrl ?? null
}
