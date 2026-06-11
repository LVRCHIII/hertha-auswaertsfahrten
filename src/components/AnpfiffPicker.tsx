const PRESET_ZEITEN = ['13:30', '15:30', '18:30', '20:30'] as const

const inputClass =
  'w-full rounded-lg border border-shell-fg/20 bg-shell-fg/8 px-3 py-2 text-shell-fg outline-none focus:border-shell-cta-bg focus:ring-2 focus:ring-shell-cta-bg/40'

type AnpfiffPickerProps = {
  value: string
  onChange: (value: string) => void
  required?: boolean
}

function formatPresetLabel(time: string): string {
  return `${time.replace(':', '.')} Uhr`
}

export function AnpfiffPicker({ value, onChange, required = false }: AnpfiffPickerProps) {
  const isPreset = PRESET_ZEITEN.includes(value as (typeof PRESET_ZEITEN)[number])

  return (
    <div>
      <span className="mb-2 block text-sm font-medium" id="anpfiff-label">
        Anpfiff <span className="text-red-500">*</span>
      </span>

      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-labelledby="anpfiff-label">
        {PRESET_ZEITEN.map((zeit) => {
          const selected = value === zeit
          return (
            <button
              key={zeit}
              type="button"
              onClick={() => onChange(zeit)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                selected
                  ? 'border-shell-cta-bg bg-shell-cta-bg text-shell-cta-fg'
                  : 'border-shell-fg/20 bg-shell-fg/8 text-shell-fg/80 hover:border-shell-cta-bg hover:bg-shell-cta-bg/10'
              }`}
              aria-pressed={selected}
            >
              {formatPresetLabel(zeit)}
            </button>
          )
        })}
      </div>

      <input
        type="hidden"
        value={value}
        required={required}
        readOnly
        tabIndex={-1}
        aria-hidden
      />

      <label className="mb-1 block text-xs font-medium text-shell-fg/70" htmlFor="anpfiff-custom">
        Eigene Zeit
      </label>
      <input
        id="anpfiff-custom"
        type="time"
        value={isPreset ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        aria-describedby="anpfiff-hint"
      />
      <p id="anpfiff-hint" className="mt-1 text-xs text-shell-fg/55">
        Typische Anstoßzeiten per Klick — oder hier eine andere Uhrzeit wählen.
      </p>
    </div>
  )
}
