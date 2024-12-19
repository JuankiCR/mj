const CACHE_NAME = "mj-pwa-cache-v6";
const urlsToCache = [
  "/", // Página principal
  "/assets/mj.jpg", // Imagen estática
];

// Manejar instalación y cacheo de archivos
self.addEventListener("install", (event) => {
  console.log("Service Worker: Instalando...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Archivos en caché correctamente");
      return cache.addAll(urlsToCache);
    }).catch((error) => {
      console.error("Error al caché durante la instalación:", error);
    })
  );
});

// Manejar activación y limpiar caché antiguo
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activando...");
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
    }).then(() => {
      console.log("Cache actualizado correctamente.");
      return self.clients.claim();
    })
  );
});

// Manejar solicitudes de red con estrategia dinámica
self.addEventListener("fetch", (event) => {
  console.log("Interceptando solicitud:", event.request.url);
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Devuelve desde caché si está disponible
      if (response) {
        console.log("Sirviendo desde caché:", event.request.url);
        return response;
      }
      // Si no está en caché, solicita desde la red
      console.log("Solicitando desde la red:", event.request.url);
      return fetch(event.request).then((networkResponse) => {
        // Guardar en caché las respuestas dinámicas
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch((error) => {
        console.error("Error en la solicitud de red:", error);
        throw error; // Lanza el error si no puede responder
      });
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
    data: { url: data.url || "/" }, // Datos como objeto
  };

  event.waitUntil(
    self.registration.showNotification(title, options).catch((error) => {
      console.error("Error al mostrar la notificación:", error);
    })
  );
});

// Manejar clics en las notificaciones
self.addEventListener("notificationclick", (event) => {
  console.log("Notificación clickeada:", event.notification);
  const url = event.notification.data.url || "/";
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        const client = clientList[0];
        console.log("Focuseando cliente existente...");
        return client.navigate(url).then(() => client.focus());
      }
      console.log("Abriendo nueva ventana del cliente...");
      return clients.openWindow(url);
    }).catch((error) => {
      console.error("Error al manejar el clic en la notificación:", error);
    })
  );
});

// Manejar eventos de sincronización en segundo plano (opcional)
self.addEventListener("sync", (event) => {
  console.log("Sincronización en segundo plano:", event.tag);
  if (event.tag === "sync-data") {
    event.waitUntil(
      // Lógica para sincronizar datos en segundo plano
      fetch("/api/sync").then((response) => {
        console.log("Datos sincronizados correctamente.");
      }).catch((error) => {
        console.error("Error al sincronizar datos:", error);
      })
    );
  }
});
