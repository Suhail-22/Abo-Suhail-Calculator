// service-worker.js محسن
const CACHE_NAME = 'abo-suhail-calculator-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/icon.svg',
  '/manifest.json',
  // سيتم إضافة الملفات الديناميكية أثناء التشغيل
];

self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Service Worker: Caching core files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('🎯 Service Worker: Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // استثناء طلبات التحليلات والخدمات الخارجية
  if (event.request.url.includes('google-analytics') || 
      event.request.url.includes('api.') ||
      !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إذا وجد في الكاش
        if (response) {
          return response;
        }

        // إذا لم يوجد، جلب من الشبكة
        return fetch(event.request)
          .then((networkResponse) => {
            // تخزين الردود الناجحة فقط
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // للطلبات الديناميكية، أرجع صفحة الأساس
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            return new Response('التطبيق يعمل بدون اتصال', {
              headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
          });
      })
  );
});