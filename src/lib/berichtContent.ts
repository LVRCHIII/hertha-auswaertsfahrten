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
  return extractPlainText(doc).trim().length === 0
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
  const candidate = input as JSONContent
  if (candidate?.type === 'doc' && Array.isArray(candidate.content)) {
    return candidate
  }
  return EMPTY_BERICHT_DOC
}

function docHasImage(node: JSONContent): boolean {
  if (node.type === 'image') return true
  if (!node.content?.length) return false
  return node.content.some(docHasImage)
}
