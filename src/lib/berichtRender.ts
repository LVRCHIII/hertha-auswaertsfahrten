import { generateHTML } from '@tiptap/html'
import type { JSONContent } from '@tiptap/core'
import { getBerichtExtensions } from './berichtExtensions'
import { normalizeBerichtDoc } from './berichtContent'

export function renderBerichtHtml(contentJson: JSONContent | Record<string, unknown>): string {
  const doc = normalizeBerichtDoc(contentJson as Record<string, unknown>)
  return generateHTML(doc, getBerichtExtensions())
}
