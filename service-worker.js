



const APP_CACHE_NAME = 'ai-calculator-app-v22';
const DYNAMIC_CACHE_NAME = 'ai-calculator-dynamic-v22';
const APP_SHELL_URLS = [
  '.',
  'index.html',
  'manifest.json',
  // Local Source Code
  'index.tsx',
  'App.tsx',
  'types.ts',
  'constants.ts',
  'hooks/useCalculator.tsx',
  'hooks/useLocalStorage.tsx',
  'services/calculationEngine.ts',
  'services/geminiService.ts',
  'services/localErrorFixer.ts',
  'components/AboutPanel.tsx',
  'components/Button.tsx',
  'components/ButtonGrid.tsx',
  'components/Calculator.tsx',
  'components/ConfirmationDialog.tsx',
  'components/Display.tsx',
  'components/ErrorBoundary.tsx',
  'components/Header.tsx',
  'components/HistoryPanel.tsx',
  'components/Icon.tsx',
  'components/Notification.tsx',
  'components/Overlay.tsx',
  'components/SettingsPanel.tsx',
  'components/SupportPanel.tsx',
  // App Assets
  'assets/icon.svg',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/screenshot-narrow.png',
  'assets/screenshot-wide.png',
  // Critical 3rd party resources needed for the app shell to render
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&family=Cairo:wght@400;700&family=Almarai:wght@400;700&display=swap',
  'https://esm.sh/react@18.3.1',
  'https://esm.sh/react-dom@18.3.1/client',
  'https://esm.sh/react@18.3.1/jsx-runtime',
  'https://esm.sh/scheduler@0.23.2',
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

self.addEventListener('fetch', event => {
  // Strategy: Network-first for navigation requests (HTML pages).
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // If we get a response, cache it and return it.
          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // If the network fails, serve the main page from the app shell cache.
          // We look for 'index.html' specifically as a robust fallback.
          return caches.match('index.html');
        })
    );
    return;
  }

  // Strategy: Cache-first for all other requests (JS, CSS, images, fonts, etc.).
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // If we have a response in the cache, we return it.
        if (cachedResponse) {
          return cachedResponse;
        }

        // If it's not in the cache, we fetch it from the network.
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response.
            // We don't cache error responses (e.g. 404).
            // Opaque responses are for no-cors requests, we cache them but cannot inspect them.
            if (!networkResponse || (networkResponse.status !== 200 && networkResponse.type !== 'opaque')) {
              return networkResponse;
            }

            // Clone and cache the response for next time.
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });

            return networkResponse;
          }
        );
      })
  );
});


self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});