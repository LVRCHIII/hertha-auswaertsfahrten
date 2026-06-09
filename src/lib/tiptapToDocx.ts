import {
  Paragraph,
  TextRun,
  HeadingLevel,
} from 'docx'
import type { JSONContent } from '@tiptap/core'

function marksToTextRun(text: string, marks?: JSONContent['marks']): TextRun {
  const bold = marks?.some((m) => m.type === 'bold') ?? false
  const italics = marks?.some((m) => m.type === 'italic') ?? false
  const underline = marks?.some((m) => m.type === 'underline') ? { color: '000000' } : undefined
  return new TextRun({ text, bold, italics, underline, font: 'Arial', size: 24 })
}

function nodeToRuns(node: JSONContent): TextRun[] {
  if (node.type === 'text') {
    return [marksToTextRun(node.text ?? '', node.marks)]
  }
  if (node.type === 'hardBreak') {
    return [new TextRun({ text: '', break: 1 })]
  }
  return (node.content ?? []).flatMap(nodeToRuns)
}

function listItemParagraph(node: JSONContent, num: { ref: string; level: number }): Paragraph[] {
  const result: Paragraph[] = []
  for (const child of node.content ?? []) {
    if (child.type === 'paragraph') {
      result.push(
        new Paragraph({
          numbering: { reference: num.ref, level: num.level },
          children: (child.content ?? []).flatMap(nodeToRuns),
        }),
      )
    } else {
      result.push(...convertNode(child))
    }
  }
  return result
}

function convertList(node: JSONContent, ordered: boolean, level = 0): Paragraph[] {
  return (node.content ?? []).flatMap((item) =>
    listItemParagraph(item, {
      ref: ordered ? 'ordered' : 'bullets',
      level,
    }),
  )
}

export function convertNode(node: JSONContent): Paragraph[] {
  switch (node.type) {
    case 'doc':
      return (node.content ?? []).flatMap(convertNode)

    case 'paragraph': {
      const runs = (node.content ?? []).flatMap(nodeToRuns)
      return [
        new Paragraph({
          children: runs.length ? runs : [new TextRun('')],
          spacing: { after: 120 },
        }),
      ]
    }

    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1
      const headingMap: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
      }
      return [
        new Paragraph({
          heading: headingMap[level] ?? HeadingLevel.HEADING_2,
          children: (node.content ?? []).flatMap(nodeToRuns),
          spacing: { before: 200, after: 100 },
        }),
      ]
    }

    case 'blockquote':
      return (node.content ?? []).flatMap((child) => {
        const runs = (child.content ?? []).flatMap(nodeToRuns)
        return [
          new Paragraph({
            children: runs,
            indent: { left: 720 },
            border: { left: { style: 'single' as const, size: 6, color: 'CCCCCC', space: 4 } },
            spacing: { after: 120 },
          }),
        ]
      })

    case 'bulletList':
      return convertList(node, false)

    case 'orderedList':
      return convertList(node, true)

    default:
      return []
  }
}

export function tiptapToDocxParagraphs(doc: JSONContent): Paragraph[] {
  return convertNode(doc)
}

export function starRow(label: string, value: number | null): string {
  if (value == null) return ''
  const filled = '★'.repeat(value)
  const empty = '☆'.repeat(5 - value)
  return `${label}: ${filled}${empty}`
}

export function formatErgebnis(heim: number | null, gast: number | null, gegner: string): string {
  if (heim == null || gast == null) return ''
  return `Hertha BSC ${heim} : ${gast} ${gegner}`
}

export function metaParagraphs(
  ergebnisText: string,
  zuschauer: number | null,
  bewertungSpiel: number | null,
  bewertungAtmosphaere: number | null,
  bewertungPommes: number | null,
): Paragraph[] {
  const lines: string[] = []
  if (ergebnisText) lines.push(ergebnisText)
  if (zuschauer != null) lines.push(`Zuschauer: ${zuschauer.toLocaleString('de-DE')}`)
  const ratings = [
    starRow('Spiel', bewertungSpiel),
    starRow('Atmosphäre', bewertungAtmosphaere),
    starRow('Pommes', bewertungPommes),
  ].filter(Boolean)
  if (ratings.length) lines.push(...ratings)

  return lines.map(
    (text) =>
      new Paragraph({
        children: [new TextRun({ text, font: 'Arial', size: 22 })],
        spacing: { after: 80 },
      }),
  )
}

export function spacerParagraph(): Paragraph {
  return new Paragraph({ children: [new TextRun('')], spacing: { after: 200 } })
}
