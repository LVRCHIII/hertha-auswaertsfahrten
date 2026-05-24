import { useRef, useState } from 'react'
import { replaceFutbologySpiele } from '../lib/futbologyApi'
import { parseFutbologyCsv } from '../lib/futbologyCsv'

type Props = {
  userId: string
  onUploaded?: () => void
}

export function FutbologyCsvUpload({ userId, onUploaded }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [count, setCount] = useState<number | null>(null)

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setStatus('loading')
    setMessage(null)
    setCount(null)

    try {
      const text = await file.text()
      const rows = parseFutbologyCsv(text)

      if (rows.length === 0) {
        setStatus('error')
        setMessage('Keine gültigen Einträge in der CSV gefunden. Prüfe das Format (Trennzeichen | oder ,).')
        return
      }

      const { count: imported, error } = await replaceFutbologySpiele(userId, rows)
      if (error) {
        setStatus('error')
        setMessage(error)
      } else {
        setStatus('success')
        setCount(imported)
        onUploaded?.()
      }
    } catch {
      setStatus('error')
      setMessage('Fehler beim Lesen der Datei.')
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Futbology CSV</label>
      <p className="mb-3 text-xs text-slate-500">
        Exportiere deine besuchten Spiele aus Futbology als CSV und lade sie hier hoch. Ein
        erneuter Upload ersetzt deine vorherigen Einträge vollständig.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={status === 'loading'}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg bg-hertha-mid px-4 py-2 text-sm font-semibold text-white transition hover:bg-hertha-blue disabled:opacity-60"
        >
          {status === 'loading' ? 'Wird importiert …' : 'CSV hochladen'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={(e) => void handleFile(e)}
        />
        {status === 'success' && count !== null ? (
          <p className="text-sm font-medium text-green-700">{count} Spiele importiert.</p>
        ) : null}
        {status === 'error' && message ? (
          <p className="text-sm text-red-600" role="alert">
            {message}
          </p>
        ) : null}
      </div>
    </div>
  )
}
