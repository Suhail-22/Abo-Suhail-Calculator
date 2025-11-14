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
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return the cached response if it exists.
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If not in cache, fetch from the network.
        return fetch(event.request).then(
          networkResponse => {
            // A response is a stream and can only be consumed once.
            // We need to clone it to put one copy in the cache and return the other to the browser.
            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME).then(cache => {
              // We only want to cache successful GET requests. Opaque responses are also fine.
              if (event.request.method === 'GET') {
                 cache.put(event.request, responseToCache);
              }
            });
            
            return networkResponse;
          }
        ).catch(() => {
          // If the network request fails and there is no cached response,
          // for navigation requests, return the main index.html page. This is key for SPAs.
          if (event.request.mode === 'navigate') {
            return caches.match('index.html');
          }
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