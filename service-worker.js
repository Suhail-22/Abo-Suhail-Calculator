const CACHE_NAME = 'ai-calculator-v14'; // Incremented version to trigger update
const URLS_TO_CACHE = [
  '/',
  'index.html',
  'index.tsx',
  'manifest.json',
  'App.tsx',
  'types.ts',
  'constants.ts',
  'components/AboutPanel.tsx',
  'components/Button.tsx',
  'components/ButtonGrid.tsx',
  'components/Calculator.tsx',
  'components/ConfirmationDialog.tsx',
  'components/Display.tsx',
  'components/Header.tsx',
  'components/HistoryPanel.tsx',
  'components/Icon.tsx',
  'components/Notification.tsx',
  'components/Overlay.tsx',
  'components/SettingsPanel.tsx',
  'components/SupportPanel.tsx',
  'hooks/useCalculator.tsx',
  'hooks/useLocalStorage.tsx',
  'services/calculationEngine.ts',
  'services/geminiService.ts',
  'services/localErrorFixer.ts',
  'assets/icon.svg',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/screenshot-narrow.png',
  'assets/screenshot-wide.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&family=Cairo:wght@400;700&family=Almarai:wght@400;700&display=swap',
  'https://esm.sh/react@18.3.1',
  'https://esm.sh/react-dom@18.3.1/client'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        const urlsToCache = URLS_TO_CACHE.map(url => new Request(url, {cache: 'reload'}));
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache app shell during install:', error);
      })
  );
});

self.addEventListener('fetch', event => {
  // Use a cache-first strategy for all requests to ensure offline functionality.
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // If a cached response is found, return it.
        if (cachedResponse) {
          return cachedResponse;
        }

        // If not in cache, fetch from the network.
        return fetch(event.request).then(
          networkResponse => {
            // A response is a stream and can only be consumed once.
            // We need to clone it to have one copy for the browser and one for the cache.
            const responseToCache = networkResponse.clone();

            // Cache the new response if it's a valid, successful, non-opaque response.
            if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }

            return networkResponse;
          }
        ).catch(error => {
          // When a network request fails (offline), provide a fallback.
          console.error('Service Worker fetch failed for:', event.request.url, error);

          // For navigation requests, serve the main app page from the cache.
          if (event.request.mode === 'navigate') {
            return caches.match('index.html');
          }
          
          // For other requests (e.g. scripts, images), there's no generic fallback.
          // The request will fail, and the browser will handle it.
        });
      })
  );
});


self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});