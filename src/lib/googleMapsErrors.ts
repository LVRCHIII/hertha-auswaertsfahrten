/** Hinweis, wenn der API-Key die aktuelle Origin nicht erlaubt. */
export function refererRestrictionHint(): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
  return (
    `Google Maps API-Key: In der Cloud Console unter HTTP referrers eintragen: ` +
    `http://localhost:5173/* und http://127.0.0.1:5173/* ` +
    `(App läuft fest auf Port 5173 — siehe npm run dev). ` +
    `Aktuell: ${origin}`
  )
}

export function isRefererOrAuthError(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes('referernotallowed') ||
    lower.includes('referer') ||
    lower.includes('request_denied') ||
    lower.includes('api key') ||
    lower.includes('apikey')
  )
}

export function messageForGoogleMapsFailure(rawMessage?: string): string {
  if (rawMessage && isRefererOrAuthError(rawMessage)) {
    return refererRestrictionHint()
  }
  return refererRestrictionHint()
}
