
const CACHE_NAME = 'abo-suhail-calc-v11-stable';
const DATA_CACHE_NAME = 'data-cache-v2';

// FILES TO CACHE IMMEDIATELY (Critical for "Install App" button to appear)
// Only absolute essentials. 
// IMPORTANT: Do NOT cache index.tsx or other source files here as they may not exist in the production build.
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon.svg'
];

// Install Event: Cache only the critical local shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching local shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Fetch Event: Network First for HTML, Stale-While-Revalidate for others
self.addEventListener('fetch', (event) => {
  // 1. Navigation (HTML): Network First -> Cache Fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          return caches.match('./index.html');
        })
    );
    return;
  }

  // 2. Assets & Code: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Only cache valid responses (not 404s)
        if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
        }
        return networkResponse;
      }).catch(err => {
          // Network failed
      });

      return cachedResponse || fetchPromise;
    })
  );
});
