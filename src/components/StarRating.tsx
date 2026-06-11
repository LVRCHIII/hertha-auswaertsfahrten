type StarRatingProps = {
  value: number | null
  onChange?: (value: number) => void
  readonly?: boolean
  label?: string
  emoji?: string
}

export function StarRating({ value, onChange, readonly = false, label, emoji = '⭐' }: StarRatingProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      {label ? (
        <span className="text-xs text-shell-fg/55 font-medium text-center leading-tight">{label}</span>
      ) : null}
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = value !== null && star <= value
          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              onClick={() => onChange?.(star)}
              className={`text-lg leading-none transition-transform ${
                readonly ? 'cursor-default' : 'hover:scale-125 active:scale-110 cursor-pointer'
              }`}
              aria-label={`${star} von 5`}
            >
              <span className={filled ? 'opacity-100' : 'opacity-20'}>{emoji}</span>
            </button>
          )
        })}
      </div>
      {!readonly && value !== null ? (
        <button
          type="button"
          onClick={() => onChange?.(0)}
          className="text-[10px] text-shell-fg/45 hover:text-shell-fg/70"
        >
          zurücksetzen
        </button>
      ) : null}
    </div>
  )
}
