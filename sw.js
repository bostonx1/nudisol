const CACHE_NAME = 'nudisol-v7';
const ASSETS = [
  '/',
  '/index.html',
  '/portada_app_nudisol.png',
  '/nudisol-login.html',
  '/nudisol-mapa.html',
  '/nudisol-alojamiento.html',
  '/nudisol-perfil.html',
  '/nudisol-editar-perfil.html',
  '/nudisol-notificaciones.html',
  '/nudisol-privacidad.html',
  '/nudisol-comunidad.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Red primero, caché como fallback — solo para GET
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
