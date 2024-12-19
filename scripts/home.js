// Conectar al WebSocket
const SOCKET_URL = "wss://api.juankicr.dev/";
let socket;

// Determina el destinatario en función del usuario actual
const getRecipientUsername = () => {
  const username = localStorage.getItem("username");
  if (username === "Mel") return "Juanki";
  if (username === "Juanki") return "Mel";
  return null;
};

// Función para iniciar la conexión WebSocket
const connectWebSocket = () => {
  const username = localStorage.getItem("username");

  if (!username) {
    console.warn("No se encontró un usuario configurado. Configúralo antes de conectar.");
    return;
  }

  console.log(`Conectando al WebSocket como: ${username}`);

  socket = new WebSocket(SOCKET_URL);

  socket.addEventListener("open", async () => {
    console.log("Conexión WebSocket establecida.");

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: "BKGVsfK793n5SZzcfjNf9ejKxWgDMISSGpPAwfQ1YZaEXyWmOxvAD4XOZxsEVUnP1c5Qhu9OrNZjBPq4T262ChU",
        });
        console.log("Nueva suscripción creada:", subscription);
      } catch (error) {
        console.error("Error al crear la suscripción:", error);
        return;
      }
    }

    socket.send(JSON.stringify({ type: "register", username, subscription }));
    console.log("Datos enviados al WebSocket:", { username, subscription });

    try {
      const response = await fetch("https://api.juankicr.dev/notifications/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, subscription }),
      });

      if (!response.ok) {
        console.error("Error al registrar la suscripción en el servidor.");
      }
    } catch (error) {
      console.error("Error al registrar la suscripción:", error);
    }
  });

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    console.log("Mensaje recibido del servidor:", data);

    if (data.type === "receiveKiss" || data.type === "receiveHug") {
      showNotification(
        data.type === "receiveKiss" ? "💋 ¡Besos recibidos!" : "🤗 ¡Abrazos recibidos!",
        data.message
      );
    }
  });

  socket.addEventListener("close", () => {
    console.log("Conexión cerrada. Reintentando...");
    setTimeout(connectWebSocket, 5000);
  });

  socket.addEventListener("error", (error) => {
    console.error("Error en la conexión WebSocket:", error);
  });
};

// Función para mostrar notificaciones (local o push)
const showNotification = (title, body) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  } else {
    console.warn("Permiso para notificaciones no otorgado.");
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
const setupInteractionButtons = () => {
  const recipientUsername = getRecipientUsername();
  if (!recipientUsername) {
    console.warn("No se pudo determinar el destinatario.");
    return;
  }

  const kissButton = document.getElementById("sendKisses");
  const hugButton = document.getElementById("sendHugs");
  let kissCount = 0;
  let hugCount = 0;
  let kissTimeout;
  let hugTimeout;

  kissButton.addEventListener("mousedown", () => {
    kissCount++;
    clearTimeout(kissTimeout);
    kissTimeout = setTimeout(() => {
      socket.send(JSON.stringify({ type: "sendKiss", count: kissCount, to: recipientUsername }));
      kissCount = 0;
    }, 2000);
  });

  hugButton.addEventListener("mousedown", () => {
    hugCount++;
    clearTimeout(hugTimeout);
    hugTimeout = setTimeout(() => {
      socket.send(JSON.stringify({ type: "sendHug", count: hugCount, to: recipientUsername }));
      hugCount = 0;
    }, 2000);
  });
};


// Verificar si hay un usuario configurado
const usernameIsSet = () => localStorage.getItem("username") !== null;


// Configurar el nombre del usuario
const setUsername = (username) => {
  if (!username || typeof username !== "string" || username.trim() === "") {
    console.error("El username proporcionado no es válido:", username);
    return;
  }

  username = username.trim();
  localStorage.setItem("username", username);
  console.log(`Usuario configurado: ${username}`);
  connectWebSocket();
  location.reload();
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
        console.log("Permiso para notificaciones otorgado.");
      } else {
        console.log("Permiso para notificaciones denegado.");
      }
    });
  }

  if (usernameIsSet()) {
    const whosThere = document.getElementById("whosThere");
    whosThere.classList.add("hidden");
    connectWebSocket();
  } else {
    console.warn("No se encontró un usuario configurado. Por favor, establece un nombre de usuario.");
  }
};
