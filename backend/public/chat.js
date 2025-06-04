const socket = io();

// DOM элементы
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const closeChatButton = document.getElementById('closeChatButton');
const chatContainer = document.getElementById('chatContainer');

// Получение никнейма из localStorage
const nickname = localStorage.getItem('nickname') || 'Гость';

// Отправка сообщения
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  socket.emit('chatMessage', {
    user: nickname,
    message,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  chatInput.value = '';
  chatInput.focus();
});

// Получение сообщения
socket.on('chatMessage', (data) => {
  const msgEl = document.createElement('div');
  msgEl.classList.add('chat-message');

  const color = getColorForUser(data.user);

  msgEl.innerHTML = `
    <span class="chat-time">[${data.time}]</span>
    <span class="chat-user" style="color:${color}">${data.user}:</span>
    <span class="chat-text">${data.message}</span>
  `;

  chatMessages.appendChild(msgEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  playChatSound();
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
