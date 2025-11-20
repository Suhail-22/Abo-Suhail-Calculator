
const CACHE_NAME = 'abo-suhail-calc-v9-stable';
const DATA_CACHE_NAME = 'data-cache-v1';

// FILES TO CACHE IMMEDIATELY (Critical for "Install App" button to appear)
// Only local files here. No external CDNs in this list to prevent install failures.
const PRECACHE_URLS = [
  './',
  './index.html',
  './index.tsx',
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

// Fetch Event: Complex strategy for robust offline support
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. Handle Navigation Requests (HTML) -> Network First, Fallback to Cache
  // This ensures users get the latest version if online, but app works offline.
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

  // 2. Handle External Libraries (CDNs like Tailwind, React) -> Stale While Revalidate
  // This allows the app to load fast from cache, while updating in background.
  if (requestUrl.origin !== location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Update cache with new version
          if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
             caches.open(CACHE_NAME).then((cache) => {
               cache.put(event.request, networkResponse.clone());
             });
          }
          return networkResponse;
        }).catch(err => {
           // Network failed, but we might have it in cache.
           // If not in cache and network fails, the resource is unavailable.
        });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Handle Local Assets -> Cache First
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
