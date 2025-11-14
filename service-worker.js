importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  console.log(`Workbox is loaded`);
  
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // A list of local files and critical third-party resources to be precached.
  // Precaching ensures these are available offline from the very first visit.
  const filesToPrecache = [
    // App Shell
    '/',
    'index.html',
    'manifest.json',
    'offline.html',
    
    // Assets
    'assets/icon.svg',
    'assets/icon-192.png',
    'assets/icon-512.png',
    'assets/screenshot-narrow.png',
    'assets/screenshot-wide.png',
    
    // JS/TS Modules
    'index.tsx',
    'App.tsx',
    'types.ts',
    'constants.ts',
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
    'hooks/useCalculator.tsx',
    'hooks/useLocalStorage.tsx',
    'services/calculationEngine.ts',
    'services/geminiService.ts',
    'services/localErrorFixer.ts',

    // Third-party Libraries & Fonts
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&family=Cairo:wght@400;700&family=Almarai:wght@400;700&display=swap',
    'https://esm.sh/react@18.3.1',
    'https://esm.sh/react-dom@18.3.1/client',
  ];

  // Pre-cache all the essential files.
  workbox.precaching.precacheAndRoute(filesToPrecache.map(url => ({ url, revision: null })));

  // Runtime caching for Google Fonts webfonts (loaded from the precached CSS)
  workbox.routing.registerRoute(
    ({url}) => url.origin === 'https://fonts.gstatic.com',
    new workbox.strategies.CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          maxEntries: 30,
        }),
      ],
    })
  );

  // Runtime caching for any other esm.sh scripts (JS modules dependencies)
  // Switched to CacheFirst for a more robust offline-first experience.
  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://esm.sh',
    new workbox.strategies.CacheFirst({
      cacheName: 'third-party-scripts',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200]
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100, // Increased to handle more dependencies
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ]
    })
  );

  // Add a catch handler for navigation requests to provide a graceful offline fallback.
  // This is a safety net in case precaching fails or for pages not explicitly cached.
  workbox.routing.setCatchHandler(async ({ request }) => {
    if (request.destination === 'document') {
      const offlinePage = await workbox.precaching.matchPrecache('offline.html');
      return offlinePage || Response.error();
    }
    return Response.error();
  });

} else {
  console.log(`Workbox didn't load`);
}


self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});