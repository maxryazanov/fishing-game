const socket = io();
let guestName = '';



// DOM элементы
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const closeChatButton = document.getElementById('closeChatButton');
const chatContainer = document.getElementById('chatContainer');

/// Получаем имя от сервера
socket.on('assignGuestName', (name) => {
  guestName = name;
});

// Отправка сообщения
document.getElementById('chatForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (message !== '') {
    socket.emit('chatMessage', {
      user: guestName,
      text: message,
    });
    input.value = '';
  }
});

// Получение сообщений
socket.on('chatMessage', (data) => {
  const messageElement = document.createElement('div');
  messageElement.textContent = `${data.user}: ${data.text}`;
  document.getElementById('chatMessages').appendChild(messageElement);
});

// Генерация уникального цвета по нику
function getColorForUser(username) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 70%)`;
  return color;
}

// Звук сообщения
function playChatSound() {
  const sound = document.getElementById('chatSound');
  if (sound) sound.play();
}

// Закрытие чата
closeChatButton.addEventListener('click', () => {
  chatContainer.classList.add('hidden');
});
