const CACHE_NAME = "mj-pwa-cache-v1";
const urlsToCache = [
  "/",
  "/pages/home/index.html",
  "/styles/globals.css",
  "/styles/home.css",
  "/scripts/home.js",
  "/assets/images/icons/icon-192x192.png",
  "/assets/images/icons/icon-512x512.png",
  "/assets/mj.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Archivos en caché correctamente");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Eliminando caché antiguo:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log("Sirviendo desde caché:", event.request.url);
        return response;
      }
      console.log("Solicitando desde la red:", event.request.url);
      return fetch(event.request);
    })
  );
});
