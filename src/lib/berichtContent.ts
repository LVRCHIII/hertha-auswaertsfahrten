import { generateText } from '@tiptap/core'
import type { JSONContent } from '@tiptap/core'
import { getBerichtExtensions } from './berichtExtensions'

export const EMPTY_BERICHT_DOC: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

export function isBerichtEmpty(doc: JSONContent | null | undefined): boolean {
  if (!doc || typeof doc !== 'object') return true

  if (docHasImage(doc)) return false

  const text = extractPlainText(doc)
  return text.trim().length === 0
}

export function extractPlainText(doc: JSONContent): string {
  try {
    return generateText(doc, getBerichtExtensions()).trim()
  } catch {
    return ''
  }
}

export function extractBerichtPlainText(doc: JSONContent): string {
  return extractPlainText(doc)
}

export function normalizeBerichtDoc(input: Record<string, unknown>): JSONContent {
  if (
    input &&
    typeof input === 'object' &&
    input.type === 'doc' &&
    Array.isArray(input.content)
  ) {
    return input as JSONContent
  }

  return EMPTY_BERICHT_DOC
}

function docHasImage(node: JSONContent): boolean {
  if (node.type === 'image') return true
  if (!node.content?.length) return false
  return node.content.some(docHasImage)
}

export function normalizeBerichtDoc(input: Record<string, unknown>): JSONContent {
  const candidate = input as JSONContent
  if (candidate?.type === 'doc' && Array.isArray(candidate.content)) {
    return candidate
  }
  return EMPTY_BERICHT_DOC
}

export function extractBerichtPlainText(doc: JSONContent): string {
  return extractPlainText(doc)
}
