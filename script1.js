const locations = {
  river: {
    name: "Река",
    background: "./images/river.jpg",
    fishes: [
      { name: "Карась", weightRange: [200, 800], time: "any" },
      { name: "Щука", weightRange: [1000, 3000], time: "day" }
    ]
  },
  lake: {
    name: "Озеро",
    background: "./images/lake.jpg",
    fishes: [
      { name: "Окунь", weightRange: [300, 1200], time: "any" },
      { name: "Сом", weightRange: [1500, 4000], time: "night" }
    ]
  }
};

let currentLocation = "river";
let startTime = parseInt(localStorage.getItem("startTime")) || Date.now();
let offsetHours = parseInt(localStorage.getItem("offsetHours")) || 0;
if (!localStorage.getItem("startTime")) {
  localStorage.setItem("startTime", startTime.toString());
}

let coins = parseInt(localStorage.getItem("coins")) || 0;
let upgrades = JSON.parse(localStorage.getItem("upgrades") || "{}");
if (!upgrades.rod) upgrades.rod = 0;
if (!upgrades.bait) upgrades.bait = 0;

const castButton = document.getElementById("castButton");
const resultDiv = document.getElementById("result");
const catchList = document.getElementById("catchList");
const locationImage = document.getElementById("locationImage");
const locationSelect = document.getElementById("locationSelect");
const timeDisplay = document.getElementById("timeDisplay");
const coinsDisplay = document.getElementById("coins");
const waterOverlay = document.getElementById("waterOverlay");
const floatBob = document.getElementById("floatBob");

const openShopBtn = document.getElementById("openShop");
const closeShopBtn = document.getElementById("closeShop");
const shopDiv = document.getElementById("shop");
const shopButtons = shopDiv.querySelectorAll("button[data-item]");

// Задаём фон локации
function updateLocation() {
  locationImage.src = locations[currentLocation].background;
}

// Игровое время — 24 часа за 10 минут (600 секунд)
function getGameTime() {
  const elapsedSeconds = (Date.now() - startTime) / 1000;
  const gameMinutes = Math.floor(elapsedSeconds * 144); // 24 * 60 / 600 = 2.4 -> 144 ускорено для плавности
  const hours = (Math.floor(gameMinutes / 60) + offsetHours) % 24;
  const minutes = gameMinutes % 60;
  return { hours, minutes };
}

function formatGameTime() {
  const { hours, minutes } = getGameTime();
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

// Обновление фильтра времени суток
function updateLighting() {
  const { hours } = getGameTime();
  if (hours >= 20 || hours < 6) {
    waterOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; // ночь
    locationImage.style.filter = "brightness(0.6)";
  } else if (hours >= 6 && hours < 8) {
    waterOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.2)"; // утро
    locationImage.style.filter = "brightness(0.85)";
  } else if (hours >= 18 && hours < 20) {
    waterOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.2)"; // вечер
    locationImage.style.filter = "brightness(0.85)";
  } else {
    waterOverlay.style.backgroundColor = "rgba(0, 0, 0, 0)"; // день
    locationImage.style.filter = "brightness(1)";
  }
  timeDisplay.textContent = formatGameTime();
}

// Вероятность клёва зависит от времени суток и апгрейдов
function getBiteChance(hour) {
  let baseChance;
  if (hour >= 6 && hour < 9) baseChance = 0.9; // утро
  else if (hour >= 9 && hour < 17) baseChance = 0.4; // день
  else if (hour >= 17 && hour < 21) baseChance = 0.8; // вечер
  else baseChance = 0.6; // ночь

  // Улучшения
  const rodBonus = 0.1 * upgrades.rod;
  const baitBonus = 0.15 * upgrades.bait;
  let total = baseChance + rodBonus + baitBonus;
  if (total > 0.98) total = 0.98; // макс шанс
  return total;
}

function getAvailableFishes(locationKey) {
  const { hours } = getGameTime();
  const isNight = hours >= 20 || hours < 6;
  const isDay = hours >= 6 && hours < 20;
  return locations[locationKey].fishes.filter((fish) => {
    return (
      fish.time === "any" ||
      (fish.time === "day" && isDay) ||
      (fish.time === "night" && isNight)
    );
  });
}

function getRandomFish(locationKey) {
  const available = getAvailableFishes(locationKey);
  const fish = available[Math.floor(Math.random() * available.length)];
  const weight =
    Math.floor(Math.random() * (fish.weightRange[1] - fish.weightRange[0])) +
    fish.weightRange[0];
  return { ...fish, weight };
}

function saveCatch(fish) {
  const all = JSON.parse(localStorage.getItem("catchList") || "[]");
  all.push(fish);
  localStorage.setItem("catchList", JSON.stringify(all));
}

function loadCatchList() {
  const all = JSON.parse(localStorage.getItem("catchList") || "[]");
  catchList.innerHTML = "";
  all.forEach((f) => {
    const li = document.createElement("li");
    li.textContent = `${f.name} - ${f.weight} г.`;
    catchList.appendChild(li);
  });
}

function saveState() {
  localStorage.setItem("coins", coins);
  localStorage.setItem("upgrades", JSON.stringify(upgrades));
  localStorage.setItem("offsetHours", offsetHours);
}

function updateCoins() {
  coinsDisplay.textContent = coins;
}

function animateBite() {
  floatBob.style.animation = "bite 0.5s ease-in-out";
  setTimeout(() => {
    floatBob.style.animation = "bob 3s ease-in-out infinite";
  }, 500);
}

locationSelect.addEventListener("change", () => {
  // Переход между локациями + 2 часа игрового времени
  currentLocation = locationSelect.value;
  offsetHours = (offsetHours + 2) % 24;
  saveState();
  updateLocation();
  updateLighting();
});

castButton.addEventListener("click", () => {
  const { hours } = getGameTime();
  const chance = getBiteChance(hours);
  animateBite();

  if (Math.random() < chance) {
    const fish = getRandomFish(currentLocation);
    coins += Math.floor(fish.weight / 100);
    updateCoins();
    saveState();

    saveCatch(fish);
    loadCatchList();

    resultDiv.textContent = `Поймали ${fish.name} весом ${fish.weight} г!`;
  } else {
    resultDiv.textContent = "Поклёвки не было...";
  }
});

openShopBtn.addEventListener("click", () => {
  getElementById("shop").classList.remove("hidden");
});

closeShopBtn.addEventListener("click", () => {
  getElementById("shop").classList.add("hidden");
});

shopButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.getAttribute("data-item");
    const price = parseInt(btn.getAttribute("data-price"));

    if (coins >= price) {
      coins -= price;
      upgrades[item] = (upgrades[item] || 0) + 1;
      updateCoins();
      saveState();
      alert(`Куплено: ${item}`);
    } else {
      alert("Недостаточно монет");
    }
  });
});

// Анимация поклёвки
const style = document.createElement("style");
style.textContent = `
@keyframes bite {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(15deg); }
  100% { transform: translateY(0) rotate(0deg); }
}`;
document.head.appendChild(style);

// Запуск цикла обновления времени и фильтра
function gameLoop() {
  updateLighting();
  requestAnimationFrame(gameLoop);
}

updateLocation();
updateLighting();
loadCatchList();
updateCoins();
gameLoop();