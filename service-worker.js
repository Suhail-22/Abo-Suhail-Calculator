
const CACHE_NAME = 'abo-suhail-calc-v10-stable';
const DATA_CACHE_NAME = 'data-cache-v1';

// FILES TO CACHE IMMEDIATELY (Critical for "Install App" button to appear)
// Only absolute essentials. NO CODE FILES (like index.tsx) here to avoid 404s.
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
  const requestUrl = new URL(event.request.url);

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
  // This ensures the app loads instantly from cache, then updates in background.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
        }
        return networkResponse;
      }).catch(err => {
          // Network failed, suppress error if we have cache
      });

      return cachedResponse || fetchPromise;
    })
  );
});
