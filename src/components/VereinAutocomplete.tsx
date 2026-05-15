import { useEffect, useId, useRef, useState } from 'react'
import { filterVereine, type Verein } from '../data/vereine'

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-hertha-mid focus:ring-2 focus:ring-hertha-mid/30'

type VereinAutocompleteProps = {
  value: string
  onChange: (value: string) => void
  onVereinSelect: (verein: Verein) => void
  required?: boolean
}

function VereinWappen({ src }: { src: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-hertha-blue/10 text-sm"
        aria-hidden
      >
        ⚽
      </span>
    )
  }

  return (
    <img
      src={src}
      alt=""
      width={32}
      height={32}
      className="h-8 w-8 shrink-0 object-contain"
      onError={() => setFailed(true)}
    />
  )
}

export function VereinAutocomplete({
  value,
  onChange,
  onVereinSelect,
  required,
}: VereinAutocompleteProps) {
  const listId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)

  const suggestions = open ? filterVereine(value) : []

  useEffect(() => {
    setHighlightIndex(suggestions.length > 0 ? 0 : -1)
  }, [value, suggestions.length])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  function selectVerein(verein: Verein) {
    onChange(verein.name)
    onVereinSelect(verein)
    setOpen(false)
    setHighlightIndex(-1)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setOpen(true)
      return
    }

    if (!open || suggestions.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightIndex((i) => (i + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (event.key === 'Enter' && highlightIndex >= 0) {
      event.preventDefault()
      selectVerein(suggestions[highlightIndex])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1 block text-sm font-medium" htmlFor="gegner">
        Gegner <span className="text-red-500">*</span>
      </label>
      <input
        id="gegner"
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        required={required}
        placeholder="Verein suchen …"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className={inputClass}
      />

      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {suggestions.map((verein, index) => (
            <li key={verein.name} role="option" aria-selected={index === highlightIndex}>
              <button
                type="button"
                className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition hover:bg-hertha-blue/5 ${
                  index === highlightIndex ? 'bg-hertha-blue/10' : ''
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectVerein(verein)}
                onMouseEnter={() => setHighlightIndex(index)}
              >
                <VereinWappen src={verein.wappenUrl} />
                <span>
                  <span className="font-medium text-slate-900">{verein.name}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{verein.stadion}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : open && value.trim() ? (
        <p className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-lg">
          Kein Verein gefunden — Freitext wird übernommen.
        </p>
      ) : null}
    </div>
  )
}
