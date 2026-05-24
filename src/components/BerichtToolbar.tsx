import type { Editor } from '@tiptap/react'

type BerichtToolbarProps = {
  editor: Editor | null
  onImageClick: () => void
  imageBusy?: boolean
}

type ToolbarButtonProps = {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
}

function ToolbarButton({ label, active, disabled, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md px-2 py-1 text-xs font-semibold transition disabled:opacity-50 ${
        active
          ? 'bg-hertha-blue text-white'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  )
}

export function BerichtToolbar({ editor, onImageClick, imageBusy }: BerichtToolbarProps) {
  if (!editor) return null

  function setLink() {
    const previous = editor!.getAttributes('link').href as string | undefined
    const url = window.prompt('Link-URL eingeben:', previous ?? 'https://')
    if (url === null) return
    if (url.trim() === '') {
      editor!.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor!.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  return (
    <div
      className="mb-2 flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-50 p-2"
      role="toolbar"
      aria-label="Bericht formatieren"
    >
      <ToolbarButton
        label="Überschrift"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolbarButton
        label="Zwischenüberschrift"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />
      <ToolbarButton
        label="Fett"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        label="Kursiv"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        label="Unterstrichen"
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <ToolbarButton
        label="Liste"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        label="Nummeriert"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolbarButton
        label="Zitat"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <ToolbarButton label="Link" active={editor.isActive('link')} onClick={setLink} />
      <ToolbarButton
        label={imageBusy ? 'Bild …' : 'Bild'}
        disabled={imageBusy}
        onClick={onImageClick}
      />
    </div>
  )
}
