import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect } from 'react'
import type { JSONContent } from '@tiptap/core'
import { getBerichtExtensions } from '../lib/berichtExtensions'
import { BerichtToolbar } from './BerichtToolbar'

type BerichtEditorProps = {
  initialContent: JSONContent
  onChange?: (doc: JSONContent) => void
  disabled?: boolean
}

export function BerichtEditor({ initialContent, onChange, disabled = false }: BerichtEditorProps) {
  const editor = useEditor({
    extensions: getBerichtExtensions(),
    content: initialContent,
    editable: !disabled,
    onUpdate: ({ editor: current }) => onChange?.(current.getJSON()),
    editorProps: {
      attributes: {
        class:
          'bericht-prose min-h-[12rem] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-card-accent/40',
      },
    },
  })

  useEffect(() => {
    if (!editor || disabled) return
    const current = JSON.stringify(editor.getJSON())
    const next = JSON.stringify(initialContent)
    if (current !== next) {
      editor.commands.setContent(initialContent)
    }
  }, [editor, initialContent, disabled])

  return (
    <div>
      <BerichtToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
