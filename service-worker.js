const CACHE_NAME = "mj-pwa-cache-v3";
const urlsToCache = [
  "/",
  "/pages/home/index.html",
  "/styles/globals.css",
  "/styles/home.css",
  "/scripts/home.js",
  "/assets/images/icons/icon-128x128.png",
  "/assets/images/icons/icon-512x512.png",
  "/assets/mj.jpg"
];

// Manejar instalación y cacheo de archivos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Archivos en caché correctamente");
      return cache.addAll(urlsToCache);
    })
  );
});

// Manejar activación y limpiar caché antiguo
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

// Manejar solicitudes de red
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

// Manejar notificaciones push
self.addEventListener("push", (event) => {
  console.log("Notificación push recibida:", event);

  const data = event.data ? event.data.json() : {};
  const title = data.title || "Nueva notificación";
  const options = {
    body: data.body || "Tienes un nuevo mensaje.",
    icon: data.icon || "/assets/images/icons/icon-128x128.png",
    data: data.url || "/"
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Manejar clics en las notificaciones
self.addEventListener("notificationclick", (event) => {
  console.log("Notificación clickeada:", event.notification);
  const url = event.notification.data || "/";
  event.notification.close();

  event.waitUntil(clients.openWindow(url));
});
