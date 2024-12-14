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

      const transitionTime = Math.random() + .3;
      heart.style.transition = `top ${transitionTime}s ease-in-out, left ${transitionTime}s ease-in-out`;

      heart.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

      background.appendChild(heart);
    }
  }
}

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
      alert(`¡Enviaste ${kissCount} besos!`);
      kissCount = 0;
      kisCounter.innerText = "Besos: 0";
    }, 2000);
  });

  hugButton.addEventListener("mousedown", () => {
    hugCount++;
    hugCounter.innerText = `Abrazos: ${hugCount}`;

    clearTimeout(hugTimeout);
    hugTimeout = setTimeout(() => {
      alert(`¡Enviaste ${hugCount} abrazos!`);
      hugCount = 0;
      hugCounter.innerText = "Abrazos: 0";
    }, 2000);
  });
}

const usernameIsSet = () => {
  return localStorage.getItem("username") !== null;
}

const setUsername = (username) => {
  if (username) {
    localStorage.setItem("username", username);
    if (usernameIsSet()) {
      const whosThereWrapper = document.getElementById("whosThere");
      const todoListWrapper = document.getElementById("todoSection");
      whosThereWrapper.classList.add("hidden");
      todoListWrapper.classList.remove("sectionHidden");
    }
  }
}

window.onload = () => {
  createHearts();
  if (usernameIsSet()) {
    const whosThereWrapper = document.getElementById("whosThere");
    const todoListWrapper = document.getElementById("todoSection");
    whosThereWrapper.classList.add("hidden");
    todoListWrapper.classList.remove("sectionHidden");
  }
  setTimeout(() => {
    const hearts = document.querySelectorAll(".heart");

    hearts.forEach(heart => {
      const x = Math.random() * 98;
      const y = Math.random() * 98;
      heart.style.left = `${x}%`;
      heart.style.top = `${y}%`;
    });
  }, 600);
  startCountdown();
  setupInteractionButtons();
}
