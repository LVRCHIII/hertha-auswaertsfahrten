import { useEffect, useId, useRef, useState } from 'react'
import { filterVereine, type Verein } from '../data/vereine'
import { VereinWappen } from './VereinWappen'

const inputClass =
  'w-full rounded-lg border border-shell-fg/20 bg-shell-fg/8 px-3 py-2 text-shell-fg outline-none focus:border-shell-cta-bg focus:ring-2 focus:ring-shell-cta-bg/40'

type VereinAutocompleteProps = {
  value: string
  onChange: (value: string) => void
  onVereinSelect: (verein: Verein | null) => void
  required?: boolean
  label?: string
  inputId?: string
}

export function VereinAutocomplete({
  value,
  onChange,
  onVereinSelect,
  required,
  label = 'Gegner',
  inputId = 'gegner',
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
      <label className="mb-1 block text-sm font-medium" htmlFor={inputId}>
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={inputId}
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
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto glass-card rounded-lg py-1 shadow-lg"
        >
          {suggestions.map((verein, index) => (
            <li key={verein.name} role="option" aria-selected={index === highlightIndex}>
              <button
                type="button"
                className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition hover:bg-shell-cta-bg/10 ${
                  index === highlightIndex ? 'bg-shell-cta-bg/15' : ''
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectVerein(verein)}
                onMouseEnter={() => setHighlightIndex(index)}
              >
                <VereinWappen src={verein.wappenUrl} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-medium text-shell-fg">{verein.name}</span>
                    <span className="shrink-0 rounded-full bg-shell-fg/10 px-1.5 py-0.5 text-[10px] font-medium text-shell-fg/55">
                      {verein.liga}
                    </span>
                  </span>
                  {verein.stadion && (
                    <span className="mt-0.5 block truncate text-xs text-shell-fg/55">{verein.stadion}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : open && value.trim() ? (
        <p className="absolute z-20 mt-1 w-full glass-card rounded-lg px-3 py-2 text-sm text-shell-fg/55 shadow-lg">
          Kein Verein gefunden — Freitext wird übernommen.
        </p>
      ) : null}
    </div>
  )
}
