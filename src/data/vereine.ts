export type Liga =
  | '1. Bundesliga'
  | '2. Bundesliga'
  | '3. Bundesliga'
  | 'Regionalliga'
  | 'Frauen-Bundesliga'

export type Verein = {
  name: string
  stadion: string
  wappenUrl: string
  liga: Liga
  /** Zusätzliche Suchbegriffe (Kurzname, Stadt, Spitzname) */
  suchbegriffe: string[]
}

const wappen = (slug: string) => `/wappen/${slug}.png`

export const HERTHA_WAPPEN_URL = wappen('hertha')

export const VEREINE_1_BUNDESLIGA: Verein[] = [
  {
    name: 'FC Bayern München',
    stadion: 'Allianz Arena, München',
    wappenUrl: wappen('bayern'),
    liga: '1. Bundesliga',
    suchbegriffe: ['Bayern', 'FCB', 'München', 'Munich', 'Rekordmeister', 'Säbener'],
  },
  {
    name: 'Borussia Dortmund',
    stadion: 'Signal Iduna Park, Dortmund',
    wappenUrl: wappen('dortmund'),
    liga: '1. Bundesliga',
    suchbegriffe: ['BVB', 'Dortmund', 'Schwarz-Gelbe', 'Signal Iduna'],
  },
  {
    name: 'Bayer 04 Leverkusen',
    stadion: 'BayArena, Leverkusen',
    wappenUrl: wappen('leverkusen'),
    liga: '1. Bundesliga',
    suchbegriffe: ['Leverkusen', 'Bayer', 'B04', 'Werkself', 'BayArena'],
  },
  {
    name: 'RB Leipzig',
    stadion: 'Red Bull Arena, Leipzig',
    wappenUrl: wappen('rb-leipzig'),
    liga: '1. Bundesliga',
    suchbegriffe: ['Leipzig', 'RBL', 'Red Bulls'],
  },
  {
    name: 'Eintracht Frankfurt',
    stadion: 'Deutsche Bank Park, Frankfurt',
    wappenUrl: wappen('frankfurt'),
    liga: '1. Bundesliga',
    suchbegriffe: ['Frankfurt', 'SGE', 'Adler', 'Eintracht'],
  },
  {
    name: 'VfB Stuttgart',
    stadion: 'MHP Arena, Stuttgart',
    wappenUrl: wappen('stuttgart'),
    liga: '1. Bundesliga',
    suchbegriffe: ['Stuttgart', 'VfB', 'Schwaben'],
  },
  {
    name: 'SC Freiburg',
    stadion: 'Europa-Park Stadion, Freiburg',
    wappenUrl: wappen('freiburg'),
    liga: '1. Bundesliga',
    suchbegriffe: ['Freiburg', 'SCF', 'Breisgau-Brasilianer'],
  },
  {
    name: 'Borussia Mönchengladbach',
    stadion: 'Borussia-Park, Mönchengladbach',
    wappenUrl: wappen('gladbach'),
    liga: '1. Bundesliga',
    suchbegriffe: ['Gladbach', 'BMG', 'Fohlen', 'Mönchengladbach'],
  },
  {
    name: 'TSG 1899 Hoffenheim',
    stadion: 'PreZero Arena, Sinsheim',
    wappenUrl: wappen('hoffenheim'),
    liga: '1. Bundesliga',
    suchbegriffe: ['Hoffenheim', 'TSG', '1899', 'Kraichgauer'],
  },
  {
    name: 'VfL Wolfsburg',
    stadion: 'Volkswagen Arena, Wolfsburg',
    wappenUrl: wappen('wolfsburg'),
    liga: '1. Bundesliga',
    suchbegriffe: ['Wolfsburg', 'VfL', 'Wölfe'],
  },
  {
    name: '1. FC Union Berlin',
    stadion: 'Stadion An der Alten Försterei, Berlin',
    wappenUrl: wappen('union-berlin'),
    liga: '1. Bundesliga',
    suchbegriffe: ['Union', 'Union Berlin', 'FCU', 'Köpenick', 'Eisern Union'],
  },
  {
    name: '1. FC Heidenheim',
    stadion: 'Voith-Arena, Heidenheim',
    wappenUrl: wappen('heidenheim'),
    liga: '1. Bundesliga',
    suchbegriffe: ['Heidenheim', 'FCH'],
  },
  {
    name: 'FC Augsburg',
    stadion: 'WWK Arena, Augsburg',
    wappenUrl: wappen('augsburg'),
    liga: '1. Bundesliga',
    suchbegriffe: ['Augsburg', 'FCA', 'Fuggerstädter'],
  },
  {
    name: 'SV Werder Bremen',
    stadion: 'wohninvest WESERSTADION, Bremen',
    wappenUrl: wappen('werder'),
    liga: '1. Bundesliga',
    suchbegriffe: ['Werder', 'SVW', 'Bremen', 'Weser'],
  },
  {
    name: '1. FSV Mainz 05',
    stadion: 'MEWA Arena, Mainz',
    wappenUrl: wappen('mainz'),
    liga: '1. Bundesliga',
    suchbegriffe: ['Mainz', 'FSV', 'Nullfünfer', '05'],
  },
  {
    name: 'FC St. Pauli',
    stadion: 'Millerntor-Stadion, Hamburg',
    wappenUrl: wappen('st-pauli'),
    liga: '1. Bundesliga',
    suchbegriffe: ['St. Pauli', 'FCSP', 'Kiezkicker', 'Millerntor', 'Hamburg'],
  },
  {
    name: 'Hamburger SV',
    stadion: 'Volksparkstadion, Hamburg',
    wappenUrl: wappen('hsv'),
    liga: '1. Bundesliga',
    suchbegriffe: ['HSV', 'Hamburg', 'Hamburger', 'Rothosen', 'Volkspark'],
  },
]

export const VEREINE_2_BUNDESLIGA: Verein[] = [
  {
    name: '1. FC Kaiserslautern',
    stadion: 'Fritz-Walter-Stadion, Kaiserslautern',
    wappenUrl: wappen('kaiserslautern'),
    liga: '2. Bundesliga',
    suchbegriffe: ['FCK', 'Lautern', 'Kaiserslautern', 'Roten Teufel'],
  },
  {
    name: '1. FC Magdeburg',
    stadion: 'MDCC-Arena, Magdeburg',
    wappenUrl: wappen('magdeburg'),
    liga: '2. Bundesliga',
    suchbegriffe: ['FCM', 'Magdeburg'],
  },
  {
    name: '1. FC Nürnberg',
    stadion: 'Max-Morlock-Stadion, Nürnberg',
    wappenUrl: wappen('nuernberg'),
    liga: '2. Bundesliga',
    suchbegriffe: ['FCN', 'Nürnberg', 'Nuernberg', 'Club'],
  },
  {
    name: 'Arminia Bielefeld',
    stadion: 'SchücoArena, Bielefeld',
    wappenUrl: wappen('arminia-bielefeld'),
    liga: '2. Bundesliga',
    suchbegriffe: ['DSC', 'Bielefeld', 'Arminia'],
  },
  {
    name: 'Dynamo Dresden',
    stadion: 'Rudolf-Harbig-Stadion, Dresden',
    wappenUrl: wappen('dynamo-dresden'),
    liga: '2. Bundesliga',
    suchbegriffe: ['SGD', 'Dresden', 'Dynamo'],
  },
  {
    name: 'Eintracht Braunschweig',
    stadion: 'Eintracht-Stadion, Braunschweig',
    wappenUrl: wappen('braunschweig'),
    liga: '2. Bundesliga',
    suchbegriffe: ['BTSV', 'Braunschweig', 'Löwen'],
  },
  {
    name: 'FC Schalke 04',
    stadion: 'VELTINS-Arena, Gelsenkirchen',
    wappenUrl: wappen('schalke'),
    liga: '2. Bundesliga',
    suchbegriffe: ['Schalke', 'S04', 'Knappen', 'Gelsenkirchen'],
  },
  {
    name: 'Fortuna Düsseldorf',
    stadion: 'Merkur Spiel-Arena, Düsseldorf',
    wappenUrl: wappen('fortuna-duesseldorf'),
    liga: '2. Bundesliga',
    suchbegriffe: ['F95', 'Düsseldorf', 'Duesseldorf', 'Fortuna'],
  },
  {
    name: 'Hannover 96',
    stadion: 'Heinz von Heiden Arena, Hannover',
    wappenUrl: wappen('hannover'),
    liga: '2. Bundesliga',
    suchbegriffe: ['H96', 'Hannover', '96'],
  },
  {
    name: 'Hertha BSC',
    stadion: 'Olympiastadion Berlin',
    wappenUrl: wappen('hertha'),
    liga: '2. Bundesliga',
    suchbegriffe: ['Hertha', 'BSC', 'Berlin', 'Alte Dame'],
  },
  {
    name: 'Holstein Kiel',
    stadion: 'Holstein-Stadion, Kiel',
    wappenUrl: wappen('holstein-kiel'),
    liga: '2. Bundesliga',
    suchbegriffe: ['Kiel', 'Störche', 'Holstein'],
  },
  {
    name: 'Karlsruher SC',
    stadion: 'BBBank Wildpark, Karlsruhe',
    wappenUrl: wappen('karlsruhe'),
    liga: '2. Bundesliga',
    suchbegriffe: ['KSC', 'Karlsruhe'],
  },
  {
    name: 'SC Paderborn 07',
    stadion: 'Home Deluxe Arena, Paderborn',
    wappenUrl: wappen('paderborn'),
    liga: '2. Bundesliga',
    suchbegriffe: ['SCP', 'Paderborn', '07'],
  },
  {
    name: 'SC Preußen Münster',
    stadion: 'Preußenstadion, Münster',
    wappenUrl: wappen('preussen-muenster'),
    liga: '2. Bundesliga',
    suchbegriffe: ['Preußen', 'Preussen', 'Münster', 'Muenster', 'SCPM'],
  },
  {
    name: 'SpVgg Greuther Fürth',
    stadion: 'Sportpark Ronhof Thomas Sommer, Fürth',
    wappenUrl: wappen('greuther-fuerth'),
    liga: '2. Bundesliga',
    suchbegriffe: ['Fürth', 'Fuerth', 'Kleeblätter', 'Kleeblatt', 'Greuther'],
  },
  {
    name: 'SV 07 Elversberg',
    stadion: 'URSAPHARM-Arena an der Kaiserlinde, Spiesen-Elversberg',
    wappenUrl: wappen('elversberg'),
    liga: '2. Bundesliga',
    suchbegriffe: ['Elversberg', '07', 'Saarland'],
  },
  {
    name: 'SV Darmstadt 98',
    stadion: 'Merck-Stadion am Böllenfalltor, Darmstadt',
    wappenUrl: wappen('darmstadt'),
    liga: '2. Bundesliga',
    suchbegriffe: ['Lilien', 'Darmstadt', '98', 'SVD'],
  },
  {
    name: 'VfL Bochum',
    stadion: 'Vonovia Ruhrstadion, Bochum',
    wappenUrl: wappen('bochum'),
    liga: '2. Bundesliga',
    suchbegriffe: ['Bochum', 'VfL', 'Unabsteigbar'],
  },
]

export const VEREINE_3_BUNDESLIGA: Verein[] = [
  {
    name: 'FC Ingolstadt 04',
    stadion: 'Audi Sportpark, Ingolstadt',
    wappenUrl: '/wappen/fc-ingolstadt-04.png',
    liga: '3. Bundesliga',
    suchbegriffe: ['Ingolstadt', 'FCI', 'Schanzer'],
  },
  {
    name: 'SV Sandhausen',
    stadion: 'BWT-Stadion am Hardtwald, Sandhausen',
    wappenUrl: '/wappen/sv-sandhausen.png',
    liga: '3. Bundesliga',
    suchbegriffe: ['Sandhausen', 'SVS'],
  },
  {
    name: 'FC Energie Cottbus',
    stadion: 'Stadion der Freundschaft, Cottbus',
    wappenUrl: '/wappen/fc-energie-cottbus.png',
    liga: '3. Bundesliga',
    suchbegriffe: ['Cottbus', 'Energie', 'FCE'],
  },
  {
    name: 'VfL Osnabrück',
    stadion: 'Bremer Brücke, Osnabrück',
    wappenUrl: '/wappen/vfl-osnabrueck.png',
    liga: '3. Bundesliga',
    suchbegriffe: ['Osnabrück', 'VfL', 'Lila-Weiße'],
  },
  {
    name: 'SC Verl',
    stadion: 'SPORTCLUB Arena, Verl',
    wappenUrl: '/wappen/sc-verl.png',
    liga: '3. Bundesliga',
    suchbegriffe: ['Verl', 'SCV'],
  },
  {
    name: 'SV Wehen Wiesbaden',
    stadion: 'BRITA Arena, Wiesbaden',
    wappenUrl: '/wappen/sv-wehen-wiesbaden.png',
    liga: '3. Bundesliga',
    suchbegriffe: ['Wehen', 'Wiesbaden', 'SVWW'],
  },
  {
    name: 'Rot-Weiss Essen',
    stadion: 'Stadion Essen, Essen',
    wappenUrl: '/wappen/rot-weiss-essen.png',
    liga: '3. Bundesliga',
    suchbegriffe: ['Essen', 'RWE', 'Rot-Weiss'],
  },
  {
    name: 'FC Viktoria Köln',
    stadion: 'Sportpark Höhenberg, Köln',
    wappenUrl: '/wappen/fc-viktoria-koeln.png',
    liga: '3. Bundesliga',
    suchbegriffe: ['Viktoria', 'Köln', 'Köln Viktoria'],
  },
  {
    name: 'TSV 1860 München',
    stadion: 'Allianz Arena (Untermietung), München',
    wappenUrl: '/wappen/tsv-1860-muenchen.png',
    liga: '3. Bundesliga',
    suchbegriffe: ['1860', 'Löwen', 'München', 'Sechzig'],
  },
  {
    name: 'Waldhof Mannheim',
    stadion: 'Carl-Benz-Stadion, Mannheim',
    wappenUrl: '/wappen/waldhof-mannheim.png',
    liga: '3. Bundesliga',
    suchbegriffe: ['Mannheim', 'Waldhof', 'SV Waldhof'],
  },
  {
    name: 'Erzgebirge Aue',
    stadion: 'Erzgebirgsstadion, Aue',
    wappenUrl: '/wappen/erzgebirge-aue.png',
    liga: '3. Bundesliga',
    suchbegriffe: ['Aue', 'Erzgebirge', 'FCE', 'Veilchen'],
  },
  {
    name: 'FC Saarbrücken',
    stadion: 'Ludwigspark-Stadion, Saarbrücken',
    wappenUrl: '/wappen/fc-saarbruecken.png',
    liga: '3. Bundesliga',
    suchbegriffe: ['Saarbrücken', 'FCS', 'Saar'],
  },
  {
    name: 'MSV Duisburg',
    stadion: 'Schauinsland-Reisen-Arena, Duisburg',
    wappenUrl: '/wappen/msv-duisburg.png',
    liga: '3. Bundesliga',
    suchbegriffe: ['Duisburg', 'MSV', 'Zebras'],
  },
  {
    name: 'SpVgg Unterhaching',
    stadion: 'Sportpark Unterhaching, Unterhaching',
    wappenUrl: '/wappen/spvgg-unterhaching.png',
    liga: '3. Bundesliga',
    suchbegriffe: ['Unterhaching', 'SpVgg', 'Haching'],
  },
  {
    name: 'SV Meppen',
    stadion: 'Hänsch-Arena, Meppen',
    wappenUrl: '/wappen/sv-meppen.png',
    liga: '3. Bundesliga',
    suchbegriffe: ['Meppen', 'SVM'],
  },
  {
    name: 'FC Hansa Rostock',
    stadion: 'Ostseestadion, Rostock',
    wappenUrl: '/wappen/fc-hansa-rostock.png',
    liga: '3. Bundesliga',
    suchbegriffe: ['Hansa', 'Rostock', 'FCH', 'Hanseaten'],
  },
  {
    name: 'Borussia Dortmund II',
    stadion: 'Stadion Rote Erde, Dortmund',
    wappenUrl: wappen('dortmund'),
    liga: '3. Bundesliga',
    suchbegriffe: ['BVB II', 'Dortmund II', 'Dortmund 2'],
  },
  {
    name: 'FC Bayern München II',
    stadion: 'FC Bayern Campus, München',
    wappenUrl: wappen('bayern'),
    liga: '3. Bundesliga',
    suchbegriffe: ['Bayern II', 'Bayern 2', 'FCB II', 'Amateure'],
  },
  {
    name: '1. FC Köln',
    stadion: 'RheinEnergieSTADION, Köln',
    wappenUrl: '/wappen/1-fc-koeln.png',
    liga: '3. Bundesliga',
    suchbegriffe: ['Köln', 'FC Köln', 'Geißböcke', 'Effzeh'],
  },
]

export const VEREINE_REGIONAL: Verein[] = [
  {
    name: 'BFC Dynamo',
    stadion: 'Friedrich-Ludwig-Jahn-Sportpark, Berlin',
    wappenUrl: '/wappen/bfc-dynamo.png',
    liga: 'Regionalliga',
    suchbegriffe: ['BFC', 'Dynamo', 'Berlin'],
  },
  {
    name: 'Tennis Borussia Berlin',
    stadion: 'Mommsenstadion, Berlin',
    wappenUrl: '/wappen/tennis-borussia-berlin.png',
    liga: 'Regionalliga',
    suchbegriffe: ['TeBe', 'Tennis Borussia', 'Veilchen', 'Berlin'],
  },
  {
    name: 'Berliner AK 07',
    stadion: 'Stadion Lichterfelde, Berlin',
    wappenUrl: '',
    liga: 'Regionalliga',
    suchbegriffe: ['BAK', 'Berliner AK', 'Berlin'],
  },
  {
    name: 'FC Viktoria 1889 Berlin',
    stadion: 'Friedrich-Ludwig-Jahn-Sportpark, Berlin',
    wappenUrl: '',
    liga: 'Regionalliga',
    suchbegriffe: ['Viktoria', 'Viktoria Berlin', '1889', 'Berlin'],
  },
  {
    name: 'SV Babelsberg 03',
    stadion: 'Karl-Liebknecht-Stadion, Potsdam',
    wappenUrl: '/wappen/sv-babelsberg-03.png',
    liga: 'Regionalliga',
    suchbegriffe: ['Babelsberg', 'SVB', 'Potsdam', 'Nulldrei'],
  },
]

export const VEREINE_FRAUEN: Verein[] = [
  {
    name: 'Hertha BSC (Frauen)',
    stadion: 'Mommsenstadion, Berlin',
    wappenUrl: wappen('hertha'),
    liga: 'Frauen-Bundesliga',
    suchbegriffe: ['Hertha Frauen', 'Hertha BSC Frauen', 'Berlin Frauen'],
  },
  {
    name: 'FC Bayern München (Frauen)',
    stadion: 'FC Bayern Campus, München',
    wappenUrl: wappen('bayern'),
    liga: 'Frauen-Bundesliga',
    suchbegriffe: ['Bayern Frauen', 'FCB Frauen', 'München Frauen'],
  },
  {
    name: 'VfL Wolfsburg (Frauen)',
    stadion: 'AOK-Stadion, Wolfsburg',
    wappenUrl: wappen('wolfsburg'),
    liga: 'Frauen-Bundesliga',
    suchbegriffe: ['Wolfsburg Frauen', 'VfL Frauen', 'Wölfinnen'],
  },
  {
    name: 'Eintracht Frankfurt (Frauen)',
    stadion: 'Stadion am Brentanobad, Frankfurt',
    wappenUrl: wappen('frankfurt'),
    liga: 'Frauen-Bundesliga',
    suchbegriffe: ['Frankfurt Frauen', 'SGE Frauen', 'Eintracht Frauen'],
  },
  {
    name: 'SC Freiburg (Frauen)',
    stadion: 'Dreisamstadion, Freiburg',
    wappenUrl: wappen('freiburg'),
    liga: 'Frauen-Bundesliga',
    suchbegriffe: ['Freiburg Frauen', 'SCF Frauen'],
  },
  {
    name: 'RB Leipzig (Frauen)',
    stadion: 'Red Bull Arena Nebenplatz, Leipzig',
    wappenUrl: wappen('rb-leipzig'),
    liga: 'Frauen-Bundesliga',
    suchbegriffe: ['Leipzig Frauen', 'RBL Frauen'],
  },
  {
    name: 'Bayer 04 Leverkusen (Frauen)',
    stadion: 'Ulrich-Haberland-Stadion, Leverkusen',
    wappenUrl: wappen('leverkusen'),
    liga: 'Frauen-Bundesliga',
    suchbegriffe: ['Leverkusen Frauen', 'Bayer Frauen', 'Werkself Frauen'],
  },
  {
    name: 'Turbine Potsdam',
    stadion: 'Karl-Liebknecht-Stadion, Potsdam',
    wappenUrl: '/wappen/turbine-potsdam.png',
    liga: 'Frauen-Bundesliga',
    suchbegriffe: ['Turbine', 'Potsdam', 'FFC Turbine'],
  },
]

/** Alle Vereine aller Ligen kombiniert */
export const ALLE_VEREINE: Verein[] = [
  ...VEREINE_1_BUNDESLIGA,
  ...VEREINE_2_BUNDESLIGA,
  ...VEREINE_3_BUNDESLIGA,
  ...VEREINE_REGIONAL,
  ...VEREINE_FRAUEN,
]

export function filterVereine(query: string): Verein[] {
  const q = query.trim().toLowerCase()
  if (!q) return ALLE_VEREINE

  return ALLE_VEREINE.filter((verein) => {
    const haystack = [verein.name, verein.stadion, verein.liga, ...verein.suchbegriffe]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

export function findVereinByName(name: string): Verein | undefined {
  const trimmed = name.trim()
  return ALLE_VEREINE.find((v) => v.name === trimmed)
}

/** Wappen-URL für einen Gegnernamen (exakt oder über Suchbegriffe). */
export function resolveGegnerWappen(gegner: string): string | null {
  const trimmed = gegner.trim()
  if (!trimmed) return null

  const exact = findVereinByName(trimmed)
  if (exact) return exact.wappenUrl || null

  const q = trimmed.toLowerCase()
  const match = ALLE_VEREINE.find((verein) => {
    const name = verein.name.toLowerCase()
    if (name.includes(q) || q.includes(name)) return true
    return verein.suchbegriffe.some(
      (term) => term.toLowerCase() === q || q.includes(term.toLowerCase()),
    )
  })

  return match?.wappenUrl || null
}
