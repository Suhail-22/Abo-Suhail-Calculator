const CACHE_NAME = 'ai-calculator-v16'; // Incremented version to trigger update
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
        // IMPORTANT: Re-throwing the error ensures that if caching fails,
        // the service worker installation will be aborted. This prevents a
        // broken, partially cached version of the app from being activated.
        throw error;
      })
  );
});

self.addEventListener('fetch', event => {
  // Use a network-first, cache-fallback strategy.
  // This is good for keeping the app up-to-date, while providing robust offline support.
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // If the network request is successful, cache it for future offline use.
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
            // Only cache valid responses to avoid caching errors.
            if (responseToCache && responseToCache.status === 200) {
                 cache.put(event.request, responseToCache);
            }
        });
        return networkResponse;
      })
      .catch(() => {
        // If the network request fails (user is offline), try to serve the response from the cache.
        return caches.match(event.request).then(cachedResponse => {
            // If we have a cached response, return it.
            // Otherwise, for navigation requests, return the cached index.html as a fallback for the SPA.
            // For all other requests, the promise will resolve to 'undefined' and the fetch will fail as expected.
            return cachedResponse || (event.request.mode === 'navigate' ? caches.match('index.html') : undefined);
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
