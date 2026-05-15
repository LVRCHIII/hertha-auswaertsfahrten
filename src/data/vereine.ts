/** 2. Bundesliga — aktuelle Saison (Stand Tabelle 2025/26). */
export type Verein = {
  name: string
  stadion: string
  wappenUrl: string
  /** Zusätzliche Suchbegriffe (Kurzname, Stadt, Spitzname) */
  suchbegriffe: string[]
}

const wikiThumb = (path: string) =>
  `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}`

/** Alle Vereine der 2. Bundesliga Saison 2025/26 (alphabetisch). */
export const VEREINE_2_BUNDESLIGA: Verein[] = [
  {
    name: '1. FC Kaiserslautern',
    stadion: 'Fritz-Walter-Stadion, Kaiserslautern',
    wappenUrl: wikiThumb('0/0e/1._FC_Kaiserslautern_Logo.svg/64px-1._FC_Kaiserslautern_Logo.svg.png'),
    suchbegriffe: ['FCK', 'Lautern', 'Kaiserslautern', 'Roten Teufel'],
  },
  {
    name: '1. FC Magdeburg',
    stadion: 'MDCC-Arena, Magdeburg',
    wappenUrl: wikiThumb('5/5e/1._FC_Magdeburg_Logo.svg/64px-1._FC_Magdeburg_Logo.svg.png'),
    suchbegriffe: ['FCM', 'Magdeburg'],
  },
  {
    name: '1. FC Nürnberg',
    stadion: 'Max-Morlock-Stadion, Nürnberg',
    wappenUrl: wikiThumb('5/5a/1._FC_N%C3%BCrnberg_Logo.svg/64px-1._FC_N%C3%BCrnberg_Logo.svg.png'),
    suchbegriffe: ['FCN', 'Nürnberg', 'Nuernberg', 'Club'],
  },
  {
    name: 'Arminia Bielefeld',
    stadion: 'SchücoArena, Bielefeld',
    wappenUrl: wikiThumb('1/1b/Arminia_Bielefeld_Logo.svg/64px-Arminia_Bielefeld_Logo.svg.png'),
    suchbegriffe: ['DSC', 'Bielefeld', 'Arminia'],
  },
  {
    name: 'Dynamo Dresden',
    stadion: 'Rudolf-Harbig-Stadion, Dresden',
    wappenUrl: wikiThumb('9/9e/SG_Dynamo_Dresden_Logo.svg/64px-SG_Dynamo_Dresden_Logo.svg.png'),
    suchbegriffe: ['SGD', 'Dresden', 'Dynamo'],
  },
  {
    name: 'Eintracht Braunschweig',
    stadion: 'Eintracht-Stadion, Braunschweig',
    wappenUrl: wikiThumb('1/1e/Eintracht_Braunschweig_Logo.svg/64px-Eintracht_Braunschweig_Logo.svg.png'),
    suchbegriffe: ['BTSV', 'Braunschweig', 'Löwen'],
  },
  {
    name: 'FC Schalke 04',
    stadion: 'VELTINS-Arena, Gelsenkirchen',
    wappenUrl: wikiThumb('9/9d/FC_Schalke_04_Logo.svg/64px-FC_Schalke_04_Logo.svg.png'),
    suchbegriffe: ['Schalke', 'S04', 'Knappen', 'Gelsenkirchen'],
  },
  {
    name: 'Fortuna Düsseldorf',
    stadion: 'Merkur Spiel-Arena, Düsseldorf',
    wappenUrl: wikiThumb('9/9d/Fortuna_D%C3%BCsseldorf_logo.svg/64px-Fortuna_D%C3%BCsseldorf_logo.svg.png'),
    suchbegriffe: ['F95', 'Düsseldorf', 'Duesseldorf', 'Fortuna'],
  },
  {
    name: 'Hannover 96',
    stadion: 'Heinz von Heiden Arena, Hannover',
    wappenUrl: wikiThumb('c/c6/Hannover_96_Logo.svg/64px-Hannover_96_Logo.svg.png'),
    suchbegriffe: ['H96', 'Hannover', '96'],
  },
  {
    name: 'Hertha BSC',
    stadion: 'Olympiastadion Berlin',
    wappenUrl: wikiThumb('8/81/Hertha_BSC_Logo.svg/64px-Hertha_BSC_Logo.svg.png'),
    suchbegriffe: ['Hertha', 'BSC', 'Berlin', 'Alte Dame'],
  },
  {
    name: 'Holstein Kiel',
    stadion: 'Holstein-Stadion, Kiel',
    wappenUrl: wikiThumb('3/3e/Holstein_Kiel_Logo.svg/64px-Holstein_Kiel_Logo.svg.png'),
    suchbegriffe: ['Kiel', 'Störche', 'Holstein'],
  },
  {
    name: 'Karlsruher SC',
    stadion: 'BBBank Wildpark, Karlsruhe',
    wappenUrl: wikiThumb('e/ee/Karlsruher_SC_Logo.svg/64px-Karlsruher_SC_Logo.svg.png'),
    suchbegriffe: ['KSC', 'Karlsruhe'],
  },
  {
    name: 'SC Paderborn 07',
    stadion: 'Home Deluxe Arena, Paderborn',
    wappenUrl: wikiThumb('2/2f/SC_Paderborn_07_Logo.svg/64px-SC_Paderborn_07_Logo.svg.png'),
    suchbegriffe: ['SCP', 'Paderborn', '07'],
  },
  {
    name: 'SC Preußen Münster',
    stadion: 'Preußenstadion, Münster',
    wappenUrl: wikiThumb('7/7a/SC_Preussen_Muenster_Logo.svg/64px-SC_Preussen_Muenster_Logo.svg.png'),
    suchbegriffe: ['Preußen', 'Preussen', 'Münster', 'Muenster', 'SCPM'],
  },
  {
    name: 'SpVgg Greuther Fürth',
    stadion: 'Sportpark Ronhof Thomas Sommer, Fürth',
    wappenUrl: wikiThumb('4/4f/SpVgg_Greuther_F%C3%BCrth_logo.svg/64px-SpVgg_Greuther_F%C3%BCrth_logo.svg.png'),
    suchbegriffe: ['Fürth', 'Fuerth', 'Kleeblätter', 'Kleeblatt', 'Greuther'],
  },
  {
    name: 'SV 07 Elversberg',
    stadion: 'URSAPHARM-Arena an der Kaiserlinde, Spiesen-Elversberg',
    wappenUrl: wikiThumb('8/8e/SV_Elversberg_Logo.svg/64px-SV_Elversberg_Logo.svg.png'),
    suchbegriffe: ['Elversberg', '07', 'Saarland'],
  },
  {
    name: 'SV Darmstadt 98',
    stadion: 'Merck-Stadion am Böllenfalltor, Darmstadt',
    wappenUrl: wikiThumb('7/7d/SV_Darmstadt_98_Logo.svg/64px-SV_Darmstadt_98_Logo.svg.png'),
    suchbegriffe: ['Lilien', 'Darmstadt', '98', 'SVD'],
  },
  {
    name: 'VfL Bochum',
    stadion: 'Vonovia Ruhrstadion, Bochum',
    wappenUrl: wikiThumb('7/77/VfL_Bochum_Logo.svg/64px-VfL_Bochum_Logo.svg.png'),
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
