// script.js
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

const castButton = document.getElementById("castButton");
const resultDiv = document.getElementById("result");
const catchList = document.getElementById("catchList");
const locationImage = document.getElementById("locationImage");
const locationSelect = document.getElementById("locationSelect");
const timeOverlay = document.getElementById("timeOverlay");
const timeDisplay = document.getElementById("timeDisplay");
const openShop = document.getElementById("openShop");
const all = JSON.parse(localStorage.getItem("catchList") || "[]");

sellCountElement = document.getElementById("sellCount");
sellCountWeight = all.reduce((sum, fish) => sum + fish.weight, 0);
sellCountEarnings = Math.floor(sellCountWeight / 100);
sellCountElement.textContent = sellCountEarnings.toString();



function sell() {
  if (all.length === 0) {
    alert("Нет пойманной рыбы для продажи.");
    return;
  }
  const totalWeight = all.reduce((sum, fish) => sum + fish.weight, 0);
  const earnings = Math.floor(totalWeight / 100);
  sellCount = document.getElementById("sellCount");
   
  // обновляем количество денег
  localStorage.setItem("money", (parseInt(localStorage.getItem("money")) || 0) + earnings);
  localStorage.setItem("catchList", JSON.stringify([])); // очищаем список
  loadCatchList();

  alert(`Вы продали рыбу и заработали ${earnings} монет!`);
}

moneyElement = document.getElementById("coins");
let money = parseInt(localStorage.getItem("money")) || 0;
moneyElement.textContent = money.toString();


openShop.addEventListener("click", () => {
  const shopWindow = document.getElementById("shop");
  shopWindow.classList.toggle("hidden");
});
closeShop.addEventListener("click", () => {
  const shopWindow = document.getElementById("shop");
  shopWindow.classList.add("hidden");
});

function getGameTime() {
  const elapsedSeconds = (Date.now() - startTime) / 1000;
  const gameMinutes = Math.floor(elapsedSeconds * 2.4);
  const hours = (Math.floor(gameMinutes / 60) + offsetHours) % 24;
  const minutes = gameMinutes % 60;
  return { hours, minutes };
}

function formatGameTime() {
  const { hours, minutes } = getGameTime();
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function updateLighting() {
  const { hours } = getGameTime();
  if (hours >= 20 || hours < 6) {
    timeOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; // ночь
  } else if (hours >= 6 && hours < 8) {
    timeOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.2)"; // утро
  } else if (hours >= 18 && hours < 20) {
    timeOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.2)"; // вечер
  } else {
    timeOverlay.style.backgroundColor = "rgba(0, 0, 0, 0)"; // день
  }
  timeDisplay.textContent = formatGameTime();
}

function getBiteChance(hour) {
  if (hour >= 6 && hour < 9) return 0.9;     // утро
  if (hour >= 9 && hour < 17) return 0.4;    // день
  if (hour >= 17 && hour < 21) return 0.8;   // вечер
  return 0.6; // ночь
}

function getAvailableFishes(locationKey) {
  const { hours } = getGameTime();
  const isNight = hours >= 20 || hours < 6;
  const isDay = hours >= 6 && hours < 20;
  return locations[locationKey].fishes.filter(fish => {
    return fish.time === "any" ||
      (fish.time === "day" && isDay) ||
      (fish.time === "night" && isNight);
  });
}

function getRandomFish(locationKey) {
  const available = getAvailableFishes(locationKey);
  const fish = available[Math.floor(Math.random() * available.length)];
  const weight = Math.floor(Math.random() * (fish.weightRange[1] - fish.weightRange[0])) + fish.weightRange[0];
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
  all.forEach(f => {
    const li = document.createElement("li");
    li.textContent = `${f.name} - ${f.weight} г.`;
    catchList.appendChild(li);
  });
}

castButton.addEventListener("click", () => {
  const { hours } = getGameTime();
  const biteChance = getBiteChance(hours);
  resultDiv.textContent = "Поклевка...";
  setTimeout(() => {
    if (Math.random() <= biteChance) {
      const fish = getRandomFish(currentLocation);
      resultDiv.textContent = `Поймана рыба: ${fish.name}, вес: ${fish.weight} г.`;
      saveCatch(fish);
      loadCatchList();
    } else {
      resultDiv.textContent = "Не клюёт...";
    }
  }, 1500);
});

locationSelect.addEventListener("change", (e) => {
  currentLocation = e.target.value;
  locationImage.src = locations[currentLocation].background;
  offsetHours = (offsetHours + 2) % 24;
  localStorage.setItem("offsetHours", offsetHours.toString());
  updateLighting();
});

loadCatchList();
setInterval(updateLighting, 10000);
updateLighting();
