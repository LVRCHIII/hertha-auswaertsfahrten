import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import type { JSONContent } from '@tiptap/core'
import { getBerichtExtensions } from '../lib/berichtExtensions'
import { uploadBerichtImage } from '../lib/berichtStorage'
import { BerichtToolbar } from './BerichtToolbar'

type BerichtEditorProps = {
  fahrtId: string
  userId: string
  initialContent: JSONContent
  onChange?: (doc: JSONContent) => void
  disabled?: boolean
}

export function BerichtEditor({
  fahrtId,
  userId,
  initialContent,
  onChange,
  disabled = false,
}: BerichtEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    extensions: getBerichtExtensions(),
    content: initialContent,
    editable: !disabled,
    onUpdate: ({ editor: current }) => onChange?.(current.getJSON()),
    editorProps: {
      attributes: {
        class:
          'bericht-prose min-h-[12rem] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-hertha-mid/40',
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

  async function handleImageSelected(file: File | undefined) {
    if (!file || !editor) return

    setUploadError(null)
    setUploading(true)

    const result = await uploadBerichtImage(fahrtId, userId, file)
    setUploading(false)

    if (result.error || !result.url) {
      setUploadError(result.error ?? 'Bild konnte nicht hochgeladen werden.')
      return
    }

    editor.chain().focus().setImage({ src: result.url }).run()
  }

  return (
    <div>
      <BerichtToolbar
        editor={editor}
        onImageClick={() => fileInputRef.current?.click()}
        imageBusy={uploading}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          void handleImageSelected(file)
          event.target.value = ''
        }}
      />
      <EditorContent editor={editor} />
      {uploadError ? (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {uploadError}
        </p>
      ) : null}
    </div>
  )
}
