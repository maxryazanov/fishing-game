
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;



app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

const db = new sqlite3.Database('./database.db');

// Создание таблиц
db.run(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    balance INTEGER DEFAULT 0
)`);


// Регистрация
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  const hash = bcrypt.hashSync(password, 10);

  db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash], function(err) {
    if (err) return res.status(400).json({ error: 'Email уже используется' });
    req.session.userId = this.lastID;
    res.json({ success: true });
  });
});

// Вход
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }
    req.session.userId = user.id;
    res.json({ success: true });
  });
});

// Получить баланс пользователя по ID
app.get('/api/user/:id/balance', (req, res) => {
    const userId = req.params.id;

    db.get('SELECT balance FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при получении баланса' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json({ balance: row.balance });
    });
});


// Заглушка пополнения
app.post('/api/topup/mock', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Не авторизован' });

  const amount = parseInt(req.body.amount || 100);
  db.run('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, req.session.userId], function(err) {
    if (err) return res.status(500).json({ error: 'Ошибка при пополнении' });
    res.json({ success: true, added: amount });
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

let guestCounter = 1;

io.on('connection', (socket) => {
  const guestName = `Гость ${guestCounter++}`;
  console.log(`${guestName} подключился к чату`);

  // Сообщаем клиенту его имя
  socket.emit('assignGuestName', guestName);

  socket.on('chatMessage', (data) => {
    io.emit('chatMessage', data); // Рассылаем всем сообщение
  });

  socket.on('disconnect', () => {
    console.log(`${guestName} отключился от чата`);
  });
});




server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});