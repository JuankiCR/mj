if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Registrar el Service Worker
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker registrado con éxito:", registration.scope);
      })
      .catch((error) => {
        console.error("Error al registrar el Service Worker:", error);
      });

    // Solicitar permisos de notificaciones si no están otorgados
    requestNotificationPermission();

    // Manejar la instalación de la PWA si no está instalada
    setupPWAInstallation();
  });
}

// Solicitar permisos de notificaciones
function requestNotificationPermission() {
  if ("Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Permiso de notificaciones otorgado.");
        } else {
          console.log("Permiso de notificaciones denegado.");
        }
      });
    } else if (Notification.permission === "granted") {
      console.log("Permiso de notificaciones ya otorgado.");
    } else {
      console.log("Permiso de notificaciones ya denegado.");
    }
  } else {
    console.warn("Las notificaciones no están soportadas en este navegador.");
  }
}

// Manejar la instalación de la PWA
let deferredPrompt;

function setupPWAInstallation() {
  window.addEventListener("beforeinstallprompt", (event) => {
    // Evita que el prompt de instalación aparezca automáticamente
    event.preventDefault();
    deferredPrompt = event; // Guarda el evento para usarlo más tarde
    console.log("Evento beforeinstallprompt capturado.");

    // Mostrar el prompt de instalación si es posible
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("Usuario aceptó la instalación de la PWA.");
        } else {
          console.log("Usuario canceló la instalación de la PWA.");
        }
        deferredPrompt = null; // Limpia el evento
      });
    }
  });
}
