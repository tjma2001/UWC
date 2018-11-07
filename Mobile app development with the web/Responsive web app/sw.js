const CACHE_NAME = 'transporter-site-cache-v1'
const urlsToCache = [
  '/',
  '/bulma.min.css',
  '/index.html',
  '/main.js'
]

const install = event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  )
}

const fetchData = event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      const getFromServer = () =>
        fetch(event.request)
          .then(networkResponse => {
            cache.put(event.request, networkResponse.clone())
            return networkResponse
          })
      getFromServer()
      return caches.match(event.request).catch(() => getFromServer())
    })
  )
}

self.addEventListener('install', install)
self.addEventListener('fetch', fetchData)
