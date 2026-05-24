import type { ParsedCsvRow } from '../types/futbology'

function parseDatum(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`
  }
  const d = new Date(raw)
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
  return raw
}

// Native Futbology format: YYYYMMDD:stadion:heim:gast:heimTore:gastTore::liga::
function parseNativeFormat(lines: string[]): ParsedCsvRow[] {
  return lines
    .map((line): ParsedCsvRow | null => {
      const parts = line.split(':').map((p) => p.trim())
      if (parts.length < 6) return null

      const rawDate = parts[0]
      const stadion = parts[1] ?? ''
      const heim_team = parts[2]
      const gast_team = parts[3]
      const heimTore = parts[4]
      const gastTore = parts[5]
      const liga = parts[7] ?? null

      if (!rawDate || !heim_team || !gast_team) return null

      const scoreValid = heimTore !== '' && gastTore !== '' && !isNaN(Number(heimTore)) && !isNaN(Number(gastTore))
      const ergebnis = scoreValid ? `${heimTore}:${gastTore}` : null

      return {
        datum: parseDatum(rawDate),
        stadion,
        heim_team,
        gast_team,
        ergebnis,
        liga: liga || null,
      }
    })
    .filter((row): row is ParsedCsvRow => row !== null)
}

// Fallback: | or , delimited with combined score column
function parseLegacyFormat(lines: string[]): ParsedCsvRow[] {
  const delimiter = lines[0].includes('|') ? '|' : ','
  const firstLower = lines[0].toLowerCase()
  const hasHeader =
    firstLower.includes('date') ||
    firstLower.includes('datum') ||
    firstLower.includes('stadium') ||
    firstLower.includes('home')
  const dataLines = hasHeader ? lines.slice(1) : lines

  return dataLines
    .map((line): ParsedCsvRow | null => {
      const parts = line.split(delimiter).map((p) => p.trim())
      const [rawDate, stadion, heim_team, gast_team, ergebnis, liga] = parts
      if (!rawDate || !heim_team || !gast_team) return null
      return {
        datum: parseDatum(rawDate),
        stadion: stadion ?? '',
        heim_team,
        gast_team,
        ergebnis: ergebnis || null,
        liga: liga || null,
      }
    })
    .filter((row): row is ParsedCsvRow => row !== null)
}

export function parseFutbologyCsv(text: string): ParsedCsvRow[] {
  const lines = text
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length === 0) return []

  // Native Futbology export: starts with YYYYMMDD:
  if (/^\d{8}:/.test(lines[0])) {
    return parseNativeFormat(lines)
  }

  return parseLegacyFormat(lines)
}
