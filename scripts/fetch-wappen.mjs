/**
 * Lädt Vereinswappen von api-football.com herunter und speichert sie in public/wappen/.
 * Aktualisiert danach automatisch die wappenUrl-Felder in src/data/vereine.ts.
 *
 * Aufruf:
 *   API_FOOTBALL_KEY=<dein-key> node scripts/fetch-wappen.mjs
 *
 * API-Key kostenlos unter: https://dashboard.api-football.com/register
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const WAPPEN_DIR = path.join(ROOT, 'public', 'wappen')

const API_KEY = process.env.API_FOOTBALL_KEY
if (!API_KEY) {
  console.error('❌  Kein API-Key gefunden. Bitte setze: API_FOOTBALL_KEY=<key> node scripts/fetch-wappen.mjs')
  process.exit(1)
}

// Slugify: Umlaute ersetzen, Sonderzeichen entfernen
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/\s*\(frauen\)/i, '-frauen')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Alle Teams die ein Wappen brauchen (leere wappenUrl oder neu)
const TEAMS = [
  // 1. Bundesliga (nur die, die noch kein Wappen haben)
  { name: 'FC Bayern München',         search: 'Bayern',            liga: '1. Bundesliga' },
  { name: 'Borussia Mönchengladbach',  search: 'Gladbach',          liga: '1. Bundesliga' },
  { name: 'FC Augsburg',               search: 'Augsburg',          liga: '1. Bundesliga' },
  { name: 'SV Werder Bremen',          search: 'Werder',            liga: '1. Bundesliga' },
  { name: '1. FSV Mainz 05',           search: 'Mainz',             liga: '1. Bundesliga' },
  { name: 'FC St. Pauli',              search: 'Pauli',             liga: '1. Bundesliga' },
  { name: 'Hamburger SV',              search: 'Hamburger',         liga: '1. Bundesliga' },
  // 3. Bundesliga
  { name: 'FC Ingolstadt 04',          search: 'Ingolstadt',        liga: '3. Bundesliga' },
  { name: 'SV Sandhausen',             search: 'Sandhausen',        liga: '3. Bundesliga' },
  { name: 'FC Energie Cottbus',        search: 'Cottbus',           liga: '3. Bundesliga' },
  { name: 'VfL Osnabrück',             search: 'Osnabruck',         liga: '3. Bundesliga' },
  { name: 'SC Verl',                   search: 'Verl',              liga: '3. Bundesliga' },
  { name: 'SV Wehen Wiesbaden',        search: 'Wehen',             liga: '3. Bundesliga' },
  { name: 'Rot-Weiss Essen',           search: 'Essen',             liga: '3. Bundesliga' },
  { name: 'FC Viktoria Köln',          search: 'Viktoria Koln',     liga: '3. Bundesliga' },
  { name: 'TSV 1860 München',          search: '1860',              liga: '3. Bundesliga' },
  { name: 'Waldhof Mannheim',          search: 'Waldhof',           liga: '3. Bundesliga' },
  { name: 'Erzgebirge Aue',            search: 'Erzgebirge',        liga: '3. Bundesliga' },
  { name: 'FC Saarbrücken',            search: 'Saarbrucken',       liga: '3. Bundesliga' },
  { name: 'MSV Duisburg',              search: 'Duisburg',          liga: '3. Bundesliga' },
  { name: 'SpVgg Unterhaching',        search: 'Unterhaching',      liga: '3. Bundesliga' },
  { name: 'SV Meppen',                 search: 'Meppen',            liga: '3. Bundesliga' },
  { name: 'FC Hansa Rostock',          search: 'Hansa',             liga: '3. Bundesliga' },
  { name: '1. FC Köln',               search: 'FC Koln',           liga: '3. Bundesliga' },
  // Regionalliga
  { name: 'BFC Dynamo',               search: 'BFC Dynamo',        liga: 'Regionalliga' },
  { name: 'Tennis Borussia Berlin',    search: 'Tennis Borussia',   liga: 'Regionalliga' },
  { name: 'Berliner AK 07',            search: 'Berliner AK',       liga: 'Regionalliga' },
  { name: 'FC Viktoria 1889 Berlin',   search: 'Viktoria 1889',     liga: 'Regionalliga' },
  { name: 'SV Babelsberg 03',          search: 'Babelsberg',        liga: 'Regionalliga' },
  // Frauen
  { name: 'Turbine Potsdam',           search: 'Turbine Potsdam',   liga: 'Frauen-Bundesliga' },
]

async function searchTeam(searchTerm) {
  const url = `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(searchTerm)}`
  const res = await fetch(url, {
    headers: {
      'x-apisports-key': API_KEY,
    },
  })
  if (!res.ok) throw new Error(`API Fehler ${res.status}: ${res.statusText}`)
  const data = await res.json()
  return data.response ?? []
}

async function downloadImage(url, destPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download fehlgeschlagen: ${res.status}`)
  const buffer = await res.arrayBuffer()
  fs.writeFileSync(destPath, Buffer.from(buffer))
}

// Liest vereine.ts und ersetzt leere wappenUrl für einen Verein
function updateVereineTsWappenUrl(vereinName, newUrl) {
  const filePath = path.join(ROOT, 'src', 'data', 'vereine.ts')
  let content = fs.readFileSync(filePath, 'utf-8')

  // Findet den Block mit dem Namen und ersetzt leere wappenUrl: ''
  // Suche nach name: 'X', ... wappenUrl: ''  (innerhalb weniger Zeilen)
  const escapedName = vereinName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(
    `(name: '${escapedName}',[\\s\\S]{0,200}?wappenUrl: )'([^']*)'`,
  )
  content = content.replace(regex, `$1'${newUrl}'`)
  fs.writeFileSync(filePath, content, 'utf-8')
}

async function main() {
  console.log(`🔍  Starte Wappen-Download für ${TEAMS.length} Vereine...\n`)

  const results = []
  let successCount = 0
  let failCount = 0

  for (const team of TEAMS) {
    const slug = slugify(team.name)
    // PNG bevorzugen, aber api-football liefert meist PNG direkt
    const destFilename = `${slug}.png`
    const destPath = path.join(WAPPEN_DIR, destFilename)
    const wappenUrl = `/wappen/${destFilename}`

    // Überspring wenn schon vorhanden
    if (fs.existsSync(destPath)) {
      console.log(`⏭️   ${team.name} → bereits vorhanden (${destFilename})`)
      updateVereineTsWappenUrl(team.name, wappenUrl)
      results.push({ name: team.name, slug, status: 'exists' })
      successCount++
      continue
    }

    process.stdout.write(`🔍  ${team.name} … `)

    try {
      const apiResults = await searchTeam(team.search)

      if (apiResults.length === 0) {
        console.log(`❌  Nicht gefunden`)
        results.push({ name: team.name, slug, status: 'not_found' })
        failCount++
        continue
      }

      // Bestes Ergebnis: exakter Name-Match bevorzugt
      const best = apiResults.find(
        (r) => r.team.name.toLowerCase() === team.search.toLowerCase()
      ) ?? apiResults[0]

      const logoUrl = best.team.logo
      if (!logoUrl) {
        console.log(`❌  Kein Logo in API-Antwort`)
        results.push({ name: team.name, slug, status: 'no_logo' })
        failCount++
        continue
      }

      await downloadImage(logoUrl, destPath)
      updateVereineTsWappenUrl(team.name, wappenUrl)
      console.log(`✅  ${best.team.name} (ID: ${best.team.id})`)
      results.push({ name: team.name, slug, status: 'downloaded', apiName: best.team.name })
      successCount++

      // Rate-Limit: 10 req/min → 7s Pause
      await new Promise((r) => setTimeout(r, 7000))
    } catch (err) {
      console.log(`❌  Fehler: ${err.message}`)
      results.push({ name: team.name, slug, status: 'error', error: err.message })
      failCount++
    }
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`✅  Erfolgreich: ${successCount}`)
  console.log(`❌  Fehlgeschlagen: ${failCount}`)

  if (failCount > 0) {
    console.log('\n⚠️   Nicht gefundene Vereine (manuell nachtragen):')
    results
      .filter((r) => r.status !== 'downloaded' && r.status !== 'exists')
      .forEach((r) => console.log(`   - ${r.name} (${r.status})`))
  }

  console.log('\n✨  vereine.ts wurde automatisch aktualisiert.')
  console.log('   Bitte kurz prüfen: git diff src/data/vereine.ts')
}

main().catch((err) => {
  console.error('Unerwarteter Fehler:', err)
  process.exit(1)
})
