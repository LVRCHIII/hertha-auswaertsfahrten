import { useToast } from '../contexts/ToastContext'

const icons = {
  success: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  ),
}

const styles = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
}

export function Toaster() {
  const { toasts, remove } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-label="Benachrichtigungen"
      className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-6"
    >
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => remove(toast.id)}
          className={`flex max-w-sm items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg transition-all ${styles[toast.type]}`}
        >
          {icons[toast.type]}
          <span>{toast.message}</span>
        </button>
      ))}
    </div>
  )
}
