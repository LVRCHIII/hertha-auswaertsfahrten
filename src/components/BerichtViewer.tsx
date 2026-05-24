import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect } from 'react'
import type { JSONContent } from '@tiptap/core'
import { getBerichtExtensions } from '../lib/berichtExtensions'

type BerichtViewerProps = {
  content: JSONContent
}

export function BerichtViewer({ content }: BerichtViewerProps) {
  const editor = useEditor({
    extensions: getBerichtExtensions(),
    content,
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
    const next = JSON.stringify(content)
    if (current !== next) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return <EditorContent editor={editor} />
}
