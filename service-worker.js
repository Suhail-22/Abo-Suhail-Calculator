importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  console.log(`Workbox is loaded`);
  
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // Pre-cache app shell files
  workbox.precaching.precacheAndRoute([
    { url: '/', revision: null },
    { url: 'index.html', revision: null },
    { url: 'manifest.json', revision: null },
    { url: 'assets/icon.svg', revision: null },
    { url: 'assets/icon-192.png', revision: null },
    { url: 'assets/icon-512.png', revision: null },
    { url: 'assets/screenshot-narrow.png', revision: null },
    { url: 'assets/screenshot-wide.png', revision: null },
    { url: 'offline.html', revision: null }
  ]);

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

  // Caching strategy for the application's own scripts (like index.tsx)
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'script' && request.url.includes(self.location.origin),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'app-scripts'
    })
  );

  // By removing the explicit NavigationRoute that forced a 'NetworkOnly' strategy,
  // we allow Workbox's precaching to handle the app shell. This serves the
  // cached index.html when offline, which is the correct behavior for an
  // offline-first PWA.

} else {
  console.log(`Workbox didn't load`);
}


self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});