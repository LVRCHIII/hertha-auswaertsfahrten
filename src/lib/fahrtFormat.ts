const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
})

export function formatSpielDatum(spielAt: string): string {
  return dateFormatter.format(new Date(spielAt))
}

export function formatAnpfiff(spielAt: string): string {
  return timeFormatter.format(new Date(spielAt))
}

export function isUpcoming(spielAt: string): boolean {
  return new Date(spielAt) >= new Date()
}

export function combineDateAndTime(date: string, time: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute).toISOString()
}
