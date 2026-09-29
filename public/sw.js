const CACHE_NAME = 'dimo-pwa-v7-fresh-nav';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  '/apple-touch-icon.png',
  '/apple-touch-icon-precomposed.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/icon.svg',
  '/favicon-32x32.png',
  '/icone2.png',
  '/icone4.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Navigation requests (the HTML document itself) MUST be network-first.
  // Vite gives every JS/CSS bundle a content hash in its filename, and that
  // filename is only known by reading index.html — so as long as an old,
  // cached index.html keeps being served, the app is permanently stuck
  // pointing at whatever bundle existed when it was first cached, no matter
  // how many times a new version gets deployed. Fetching the network first
  // here (falling back to cache only if offline) is what actually lets a
  // deploy reach an already-installed PWA.
  const isNavigation =
    event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') || '').includes('text/html');

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Everything else (hashed JS/CSS/images) is content-addressed: the same
  // URL always means the same bytes, so cache-first is both safe and fast.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).catch(() => undefined);
    })
  );
});
