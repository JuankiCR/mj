if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker registrado con éxito:", registration.scope);
      })
      .catch((error) => {
        console.error("Error al registrar el Service Worker:", error);
      });
  });
}

// Manejo del evento `beforeinstallprompt`
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (event) => {
  // Evita que el prompt de instalación aparezca automáticamente
  event.preventDefault();
  deferredPrompt = event; // Guarda el evento para usarlo después
  console.log("Evento beforeinstallprompt capturado.");

  // Opcional: Mostrar un botón para instalar la PWA
  const installButton = document.getElementById("installButton");
  if (installButton) {
    installButton.style.display = "block";
    installButton.addEventListener("click", () => {
      deferredPrompt.prompt(); // Dispara el prompt de instalación
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("Usuario aceptó la instalación de la PWA.");
        } else {
          console.log("Usuario canceló la instalación de la PWA.");
        }
        deferredPrompt = null; // Limpia el evento
      });
    });
  }
});

// Solicitar permisos de notificaciones
function requestNotificationPermission() {
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      console.log("Permiso de notificaciones ya otorgado.");
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Permiso de notificaciones otorgado.");
        } else {
          console.log("Permiso de notificaciones denegado.");
        }
      });
    }
  } else {
    console.warn("Las notificaciones no están soportadas en este navegador.");
  }
}

// Lógica para solicitar permisos al usuario (por ejemplo, un botón)
const notificationButton = document.getElementById("notificationButton");
if (notificationButton) {
  notificationButton.addEventListener("click", () => {
    requestNotificationPermission();
  });
}
