importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  console.log(`Workbox is loaded`);
  
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // Define all the files that make up the app shell.
  // This ensures that the entire app is available offline after the first visit.
  const appShellFiles = [
    '/',
    'index.html',
    'manifest.json',
    'offline.html',
    'assets/icon.svg',
    'assets/icon-192.png',
    'assets/icon-512.png',
    'assets/screenshot-narrow.png',
    'assets/screenshot-wide.png',
    // All JS/TS modules required for the app to run
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
    'services/localErrorFixer.ts'
  ];

  // Pre-cache all the app shell files.
  workbox.precaching.precacheAndRoute(appShellFiles.map(url => ({ url, revision: null })));

  // Caching strategy for Google Fonts (stylesheets)
  workbox.routing.registerRoute(
    ({url}) => url.origin === 'https://fonts.googleapis.com',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets',
    })
  );

  // Caching strategy for Google Fonts (webfonts)
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

  // Caching strategy for Tailwind CSS and esm.sh scripts (JS modules)
  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://cdn.tailwindcss.com' || url.origin === 'https://esm.sh',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'third-party-scripts-and-styles',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200]
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
        }),
      ]
    })
  );

  // The runtime caching for app scripts is no longer needed as they are all precached.
  // This makes the offline experience much more reliable.

  // Add a catch handler for navigation requests to provide a graceful offline fallback.
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
