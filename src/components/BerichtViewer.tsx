import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect } from 'react'
import type { JSONContent } from '@tiptap/core'
import { getBerichtExtensions } from '../lib/berichtExtensions'

type BerichtViewerProps = {
  contentJson: JSONContent
}

export function BerichtViewer({ contentJson }: BerichtViewerProps) {
  const editor = useEditor({
    extensions: getBerichtExtensions(),
    content: contentJson,
    editable: false,
    editorProps: {
      attributes: {
        class: 'bericht-prose bericht-viewer text-sm text-slate-800',
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = JSON.stringify(editor.getJSON())
    const next = JSON.stringify(contentJson)
    if (current !== next) {
      editor.commands.setContent(contentJson)
    }
  }, [contentJson, editor])

  return <EditorContent editor={editor} />
}
