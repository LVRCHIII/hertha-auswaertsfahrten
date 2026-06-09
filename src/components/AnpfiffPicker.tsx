const PRESET_ZEITEN = ['13:30', '15:30', '18:30', '20:30'] as const

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-card-accent focus:ring-2 focus:ring-card-accent/30'

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
                  ? 'border-card-accent bg-card-accent text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-card-accent hover:bg-card-accent/5'
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

      <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="anpfiff-custom">
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
      <p id="anpfiff-hint" className="mt-1 text-xs text-slate-500">
        Typische Anstoßzeiten per Klick — oder hier eine andere Uhrzeit wählen.
      </p>
    </div>
  )
}
