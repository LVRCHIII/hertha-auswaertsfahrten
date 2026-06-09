import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  LevelFormat,
} from 'docx'
import { requireSupabase } from './supabase'
import { fetchBerichtBilder, removeBerichtBild } from './berichtBilderApi'
import type { Fahrt } from '../types/fahrt'
import type { Spieltagsbericht } from '../types/bericht'
import type { BerichtBild } from './berichtBilderApi'
import {
  tiptapToDocxParagraphs,
  metaParagraphs,
  formatErgebnis,
  spacerParagraph,
} from './tiptapToDocx'

const BERICHT_EXPORT_SELECT =
  'fahrt_id, author_id, content_json, content_text, ergebnis_heim, ergebnis_gast, zuschauer, bewertung_spiel, bewertung_atmosphaere, bewertung_pommes, created_at, updated_at, author:profiles!spieltagsberichte_author_id_fkey(display_name, avatar_url)'

export type SaisonInfo = { label: string; start: Date; end: Date }

export function getSaisonForDate(date: Date): string {
  const month = date.getMonth() // 0-based
  const year = date.getFullYear()
  if (month >= 7) {
    return `${year}/${String(year + 1).slice(2)}`
  }
  return `${year - 1}/${String(year).slice(2)}`
}

export function getSaisonBounds(saison: string): { start: Date; end: Date } {
  const [startYear] = saison.split('/')
  const year = parseInt(startYear, 10)
  return {
    start: new Date(`${year}-08-01T00:00:00`),
    end: new Date(`${year + 1}-07-31T23:59:59`),
  }
}

export function getAvailableSaisons(fahrten: Fahrt[]): string[] {
  const set = new Set<string>()
  for (const f of fahrten) {
    set.add(getSaisonForDate(new Date(f.spiel_at)))
  }
  return Array.from(set).sort().reverse()
}

export function filterFahrtenBySaison(fahrten: Fahrt[], saison: string): Fahrt[] {
  const { start, end } = getSaisonBounds(saison)
  return fahrten
    .filter((f) => {
      const d = new Date(f.spiel_at)
      return d >= start && d <= end
    })
    .sort((a, b) => new Date(a.spiel_at).getTime() - new Date(b.spiel_at).getTime())
}

async function fetchAllBerichte(fahrtIds: string[]): Promise<Spieltagsbericht[]> {
  if (!fahrtIds.length) return []
  const { data, error } = await requireSupabase()
    .from('spieltagsberichte')
    .select(BERICHT_EXPORT_SELECT)
    .in('fahrt_id', fahrtIds)

  if (error || !data) return []
  return data as unknown as Spieltagsbericht[]
}

async function downloadImageAsBuffer(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return await res.arrayBuffer()
  } catch {
    return null
  }
}

function formatDatum(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

type ExportEntry = {
  fahrt: Fahrt
  bericht: Spieltagsbericht
  bilder: BerichtBild[]
}

export async function buildSaisonDocx(saison: string, entries: ExportEntry[]): Promise<Blob> {
  const sections: Paragraph[][] = []

  // Cover page
  sections.push([
    new Paragraph({
      children: [new TextRun({ text: 'Hertha BSC', font: 'Arial', size: 56, bold: true, color: '003264' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 2000, after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Auswärtsfahrten', font: 'Arial', size: 44, color: '005BAC' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Saison ${saison}`, font: 'Arial', size: 36, bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `${entries.length} Auswärtsfahrt${entries.length !== 1 ? 'en' : ''}`,
          font: 'Arial',
          size: 28,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  ])

  for (const entry of entries) {
    const { fahrt, bericht, bilder } = entry
    const ergebnisText = formatErgebnis(bericht.ergebnis_heim, bericht.ergebnis_gast, fahrt.gegner)
    const datumText = formatDatum(fahrt.spiel_at)

    const pageParagraphs: Paragraph[] = [
      // Page break before each entry
      new Paragraph({ children: [new PageBreak()] }),

      // Heading: Gegner — Datum
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [
          new TextRun({
            text: `${fahrt.gegner}`,
            font: 'Arial',
            size: 40,
            bold: true,
            color: '003264',
          }),
        ],
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `${datumText} · ${fahrt.stadion}`, font: 'Arial', size: 22, color: '666666' }),
        ],
        spacing: { after: 240 },
      }),

      // Meta: Ergebnis, Zuschauer, Bewertungen
      ...metaParagraphs(
        ergebnisText,
        bericht.zuschauer,
        bericht.bewertung_spiel,
        bericht.bewertung_atmosphaere,
        bericht.bewertung_pommes,
      ),

      spacerParagraph(),

      // Bericht text
      ...tiptapToDocxParagraphs(bericht.content_json),
    ]

    // Images
    for (const bild of bilder) {
      const buffer = await downloadImageAsBuffer(bild.url)
      if (!buffer) continue

      // Guess type from URL path
      const ext = bild.path.split('.').pop()?.toLowerCase() ?? 'jpeg'
      const type = ext === 'png' ? 'png' : 'jpg'

      pageParagraphs.push(
        new Paragraph({
          children: [
            new ImageRun({
              type: type as 'png' | 'jpg',
              data: buffer,
              transformation: { width: 480, height: 320 },
              altText: { title: 'Bild', description: 'Fahrtbild', name: 'Fahrtbild' },
            }),
          ],
          spacing: { after: 120 },
        }),
      )
    }

    sections.push(pageParagraphs)
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
        {
          reference: 'ordered',
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    styles: {
      default: {
        document: { run: { font: 'Arial', size: 24 } },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 40, bold: true, font: 'Arial', color: '003264' },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 32, bold: true, font: 'Arial' },
          paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 1 },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: sections.flat(),
      },
    ],
  })

  return Packer.toBlob(doc)
}

export async function exportSaison(
  saison: string,
  fahrten: Fahrt[],
  onProgress?: (step: string) => void,
): Promise<{ blob: Blob | null; error: string | null }> {
  try {
    const saisonFahrten = filterFahrtenBySaison(fahrten, saison)
    if (!saisonFahrten.length) {
      return { blob: null, error: 'Keine Fahrten in dieser Saison.' }
    }

    onProgress?.('Berichte laden…')
    const berichte = await fetchAllBerichte(saisonFahrten.map((f) => f.id))
    const berichtMap = new Map(berichte.map((b) => [b.fahrt_id, b]))

    const withBericht = saisonFahrten.filter((f) => berichtMap.has(f.id))
    if (!withBericht.length) {
      return { blob: null, error: 'Keine Spieltagsberichte in dieser Saison.' }
    }

    onProgress?.('Bilder laden…')
    const entries: ExportEntry[] = []
    for (const fahrt of withBericht) {
      const { bilder } = await fetchBerichtBilder(fahrt.id)
      entries.push({ fahrt, bericht: berichtMap.get(fahrt.id)!, bilder })
    }

    onProgress?.('Dokument erstellen…')
    const blob = await buildSaisonDocx(saison, entries)
    return { blob, error: null }
  } catch (err) {
    return { blob: null, error: String(err) }
  }
}

export async function archiviereSaison(
  saison: string,
  fahrten: Fahrt[],
  onProgress?: (step: string) => void,
): Promise<{ error: string | null }> {
  const saisonFahrten = filterFahrtenBySaison(fahrten, saison)

  onProgress?.('Bilder löschen…')
  for (const fahrt of saisonFahrten) {
    const { bilder } = await fetchBerichtBilder(fahrt.id)
    for (const bild of bilder) {
      await removeBerichtBild(bild.id, bild.path)
    }
  }

  return { error: null }
}
