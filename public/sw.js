const CACHE_NAME = 'hertha-auswaertsfahrten-v2'
const APP_SHELL = ['/', '/manifest.webmanifest', '/icons/hertha-app-icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/')))
    return
  }

  // Stale-while-revalidate: sofort aus dem Cache antworten (falls vorhanden), aber
  // immer im Hintergrund neu laden und den Cache aktualisieren. So bleiben Assets wie
  // die Wappen-PNGs spätestens beim nächsten Reload aktuell, statt für immer im Cache
  // hängen zu bleiben (das war der Grund, warum reparierte Wappen nicht ankamen).
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok) void cache.put(request, response.clone())
            return response
          })
          .catch(() => cached)

        return cached ?? networkFetch
      }),
    ),
  )
})
