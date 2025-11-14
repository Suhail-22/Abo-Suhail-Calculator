
const APP_CACHE_NAME = 'ai-calculator-app-v19';
const DYNAMIC_CACHE_NAME = 'ai-calculator-dynamic-v19';
const APP_SHELL_URLS = [
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
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_CACHE_NAME)
      .then(cache => {
        console.log('Opened app cache. Caching app shell.');
        const requests = APP_SHELL_URLS.map(url => new Request(url, { cache: 'reload' }));
        return cache.addAll(requests);
      })
      .catch(error => {
        console.error('Failed to cache app shell during install:', error);
        throw error;
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [APP_CACHE_NAME, DYNAMIC_CACHE_NAME];
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

// Using a "Cache-first, falling back to network" strategy for all requests.
// This is robust for offline-first functionality.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Cache hit - return response
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache - go to network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response.
            // Opaque responses are for no-cors requests to third-party resources.
            if (!networkResponse || (networkResponse.status !== 200 && networkResponse.type !== 'opaque')) {
              return networkResponse;
            }

            // Clone the response because it's a stream.
            const responseToCache = networkResponse.clone();

            // All runtime caching goes into the dynamic cache.
            caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
      .catch(() => {
        // If both cache and network fail, and it's a navigation request,
        // serve the offline fallback page from the app shell cache.
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});


self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
