const CACHE_NAME = 'asc-simple-mobile-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// تثبيت Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// تفعيل Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// اعتراض الطلبات
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(function(networkResponse) {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(function() {
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            return new Response('التطبيق يعمل بدون اتصال');
          });
      })
  );
});