import type { Editor } from '@tiptap/react'
import type { ReactNode } from 'react'

type BerichtToolbarProps = {
  editor: Editor | null
}

type ToolbarButtonProps = {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}

function ToolbarButton({ label, active, disabled, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition active:scale-[0.94] disabled:opacity-50 ${
        active
          ? 'bg-card-accent text-white'
          : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span aria-hidden className="mx-0.5 h-5 w-px self-center bg-slate-300/80" />
}

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-[18px] w-[18px]',
} as const

function IconH2() {
  return (
    <svg {...iconProps}>
      <path d="M4 6v12M11 6v12M4 12h7" />
      <path d="M15 11a2.5 2.5 0 0 1 5 0c0 2.5-5 4-5 7h5" strokeWidth={1.8} />
    </svg>
  )
}

function IconH3() {
  return (
    <svg {...iconProps}>
      <path d="M4 6v12M11 6v12M4 12h7" />
      <path d="M15.5 10.5a2.3 2.3 0 0 1 4.5.7c0 1-.8 1.8-2 1.8 1.2 0 2 .8 2 1.9a2.3 2.3 0 0 1-4.5.6" strokeWidth={1.8} />
    </svg>
  )
}

function IconBold() {
  return (
    <svg {...iconProps}>
      <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" />
    </svg>
  )
}

function IconItalic() {
  return (
    <svg {...iconProps}>
      <line x1="19" y1="5" x2="10" y2="5" />
      <line x1="14" y1="19" x2="5" y2="19" />
      <line x1="14.5" y1="5" x2="9.5" y2="19" />
    </svg>
  )
}

function IconUnderline() {
  return (
    <svg {...iconProps}>
      <path d="M7 4v7a5 5 0 0 0 10 0V4" />
      <line x1="5" y1="20" x2="19" y2="20" />
    </svg>
  )
}

function IconBulletList() {
  return (
    <svg {...iconProps}>
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="4.5" cy="6" r="0.5" fill="currentColor" />
      <circle cx="4.5" cy="12" r="0.5" fill="currentColor" />
      <circle cx="4.5" cy="18" r="0.5" fill="currentColor" />
    </svg>
  )
}

function IconOrderedList() {
  return (
    <svg {...iconProps}>
      <line x1="10" y1="6" x2="20" y2="6" />
      <line x1="10" y1="12" x2="20" y2="12" />
      <line x1="10" y1="18" x2="20" y2="18" />
      <path d="M4 6h1.5M4.75 4.5V7.5M4 10.5h2L4 13.5h2M4 16.5h1.5a1 1 0 0 1 0 1.5 1 1 0 0 1 0 1.5H4" strokeWidth={1.5} />
    </svg>
  )
}

function IconQuote() {
  return (
    <svg {...iconProps}>
      <path d="M10 8c-2.5 0-4 1.8-4 4.2V16h4v-4H7.8C7.8 10.5 8.7 9.6 10 9.5zM18 8c-2.5 0-4 1.8-4 4.2V16h4v-4h-2.2c0-1.5.9-2.4 2.2-2.5z" strokeWidth={1.6} />
    </svg>
  )
}

function IconLink() {
  return (
    <svg {...iconProps}>
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </svg>
  )
}

export function BerichtToolbar({ editor }: BerichtToolbarProps) {
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
      className="mb-2 flex flex-wrap gap-0.5 rounded-xl border border-slate-200 bg-slate-50 p-1.5"
      role="toolbar"
      aria-label="Bericht formatieren"
    >
      <ToolbarButton
        label="Überschrift"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <IconH2 />
      </ToolbarButton>
      <ToolbarButton
        label="Zwischenüberschrift"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <IconH3 />
      </ToolbarButton>
      <Divider />
      <ToolbarButton
        label="Fett"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <IconBold />
      </ToolbarButton>
      <ToolbarButton
        label="Kursiv"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <IconItalic />
      </ToolbarButton>
      <ToolbarButton
        label="Unterstrichen"
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <IconUnderline />
      </ToolbarButton>
      <Divider />
      <ToolbarButton
        label="Liste"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <IconBulletList />
      </ToolbarButton>
      <ToolbarButton
        label="Nummerierte Liste"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <IconOrderedList />
      </ToolbarButton>
      <Divider />
      <ToolbarButton
        label="Zitat"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <IconQuote />
      </ToolbarButton>
      <ToolbarButton label="Link" active={editor.isActive('link')} onClick={setLink}>
        <IconLink />
      </ToolbarButton>
    </div>
  )
}
