const CACHE_NAME = 'v1';
const ASSETS = [
  '/',
  '/src/components/VRIntegration.tsx',
  '/src/components/BeamerMode.tsx'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
}); 