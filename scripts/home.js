// Conectar al WebSocket
const SOCKET_URL = "wss://api.juankicr.dev/";
let socket;

// Función para iniciar la conexión WebSocket
const connectWebSocket = () => {
  const username = localStorage.getItem("username");

  if (!username) {
    console.warn("No se encontró un usuario configurado. Esperando configuración...");
    return;
  }

  console.log(`Intentando conectar al WebSocket con el usuario: ${username}`);

  socket = new WebSocket(SOCKET_URL);

  socket.addEventListener("open", async () => {
    console.log("Conectado al servidor WebSocket");

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: "QktHVnNmSzc5M241U1p6Y2ZqTmY5ZWpLeFdnRE1JU1NHcFBBd2ZRMVlaYUVYeVdtT3h2QUQ0WE9aeHNFVlVuUDFjNVFodTlPck5aakJQcTRUMjYyQ2hV"
        });
        console.log("Nueva suscripción push creada:", subscription);
      } catch (error) {
        console.error("Error al crear la suscripción push:", error);
        return;
      }
    }

    // Validar datos antes de enviarlos
    if (!username || username === "undefined") {
      console.error("El username es inválido. No se puede registrar.");
      return;
    }

    // Enviar la información al servidor WebSocket
    socket.send(
      JSON.stringify({
        type: "register",
        username,
        subscription
      })
    );
    console.log("Datos enviados al servidor WebSocket:", { username, subscription });

    // Intentar enviar la suscripción al servidor de notificaciones (opcional)
    try {
      const response = await fetch("https://api.juankicr.dev/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, subscription })
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("Error al enviar la suscripción al servidor:", result.message);
      } else {
        console.log("Suscripción almacenada en el servidor:", result);
      }
    } catch (error) {
      console.error("Error al enviar la suscripción al servidor:", error);
    }
  });

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    console.log("Mensaje recibido del servidor:", data.type);
  });

  socket.addEventListener("error", (error) => {
    console.error("Error en la conexión WebSocket:", error);
  });

  socket.addEventListener("close", () => {
    console.log("Conexión cerrada con el servidor WebSocket. Reintentando...");
    setTimeout(() => connectWebSocket(), 5000);
  });
};

// Función para mostrar notificaciones (local o push)
const showNotification = (title, body) => {
  if ("Notification" in window && Notification.permission === "granted") {
    // Notificación local
    new Notification(title, { body });
  } else {
    console.warn("Permiso de notificación no otorgado.");
  }
};

// Crear corazones animados
const createHearts = () => {
  const background = document.getElementById("background");

  if (background) {
    for (let i = 0; i < 55; i++) {
      const heart = document.createElement("div");
      heart.classList.add("heart");

      const colors = ["#FF69B4", "#FFD700"];
      heart.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

      const size = Math.random() * 20 + 10;
      heart.style.width = `${size}px`;
      heart.style.height = `${size}px`;

      const duration = Math.random() * 3 + 3;
      heart.style.animationName = "float";
      heart.style.animationDuration = `${duration}s`;
      heart.style.animationTimingFunction = "ease-in-out";
      heart.style.animationIterationCount = "infinite";

      const transitionTime = Math.random() + 0.3;
      heart.style.transition = `top ${transitionTime}s ease-in-out, left ${transitionTime}s ease-in-out`;

      background.appendChild(heart);
    }
  }
};

// Cuenta regresiva para el aniversario
function startCountdown() {
  const AnniversaryDay = 7;
  const nextAnniversary = new Date();
  nextAnniversary.setMonth(nextAnniversary.getMonth() + 1);
  nextAnniversary.setDate(AnniversaryDay);
  nextAnniversary.setHours(0, 0, 0, 0);

  function updateTimer() {
    const now = new Date();
    const diff = nextAnniversary - now;

    if (now.getDate() === AnniversaryDay) {
      document.getElementById("timer").innerText = "¡Feliz Aniversario!";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById("timer").innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  setInterval(updateTimer, 1000);
}

// Configurar botones de interacción
function setupInteractionButtons() {
  const kissButton = document.getElementById("sendKisses");
  const hugButton = document.getElementById("sendHugs");
  const kisCounter = document.getElementById("kissCounter");
  const hugCounter = document.getElementById("hugCounter");
  let kissCount = 0;
  let hugCount = 0;
  let kissTimeout;
  let hugTimeout;

  kissButton.addEventListener("mousedown", () => {
    kissCount++;
    kisCounter.innerText = `Besos: ${kissCount}`;

    clearTimeout(kissTimeout);
    kissTimeout = setTimeout(() => {
      socket.send(JSON.stringify({ type: "sendKiss", count: kissCount }));
      kissCount = 0;
      kisCounter.innerText = "Besos: 0";
    }, 2000);
  });

  hugButton.addEventListener("mousedown", () => {
    hugCount++;
    hugCounter.innerText = `Abrazos: ${hugCount}`;

    clearTimeout(hugTimeout);
    hugTimeout = setTimeout(() => {
      socket.send(JSON.stringify({ type: "sendHug", count: hugCount }));
      hugCount = 0;
      hugCounter.innerText = "Abrazos: 0";
    }, 2000);
  });
}

// Verificar si hay un usuario configurado
const usernameIsSet = () => {
  return localStorage.getItem("username") !== null;
};

// Configurar el nombre del usuario
const setUsername = (username) => {
  if (!username || typeof username !== "string" || username.trim() === "") {
    console.error("El username proporcionado no es válido:", username);
    return;
  }

  username = username.trim();
  localStorage.setItem("username", username);
  console.log(`Usuario configurado: ${username}`);

  const whosThereWrapper = document.getElementById("whosThere");
  const todoListWrapper = document.getElementById("todoSection");

  if (whosThereWrapper && todoListWrapper) {
    whosThereWrapper.classList.add("hidden");
    todoListWrapper.classList.remove("sectionHiddenNO");
  }

  connectWebSocket(); // Conectar al WebSocket con el usuario configurado
};

window.onload = () => {
  createHearts();
  setTimeout(() => {
    const hearts = document.querySelectorAll(".heart");
    hearts.forEach((heart) => {
      const x = Math.random() * 98;
      const y = Math.random() * 98;
      heart.style.left = `${x}%`;
      heart.style.top = `${y}%`;
    });
  }, 600);

  startCountdown();
  setupInteractionButtons();

  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Permiso para notificaciones otorgado");
      } else {
        console.log("Permiso para notificaciones denegado");
      }
    });
  }

  if (usernameIsSet()) {
    const username = localStorage.getItem("username");
    console.log("Usuario encontrado en localStorage:", username);

    const whosThereWrapper = document.getElementById("whosThere");
    const todoListWrapper = document.getElementById("todoSection");

    if (whosThereWrapper && todoListWrapper) {
      whosThereWrapper.classList.add("hidden");
      todoListWrapper.classList.remove("sectionHiddenNO");
    }

    connectWebSocket(); // Conectar si el usuario ya está configurado
  } else {
    console.warn("No se encontró un usuario configurado. Por favor, establece un nombre de usuario.");
  }
};