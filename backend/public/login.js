const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

loginTab.onclick = () => {
loginTab.classList.add('active');
registerTab.classList.remove('active');
loginForm.classList.add('active');
registerForm.classList.remove('active');
};

registerTab.onclick = () => {
registerTab.classList.add('active');
loginTab.classList.remove('active');
registerForm.classList.add('active');
loginForm.classList.remove('active');
};

fetch('/api/login', { /* ... */ })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      localStorage.setItem('userId', data.userId); // 💾 сохраняем ID
      window.location.href = 'game.html';          // переход в игру
    } else {
      alert(data.message);
    }
  });

  fetch('/api/register', { /* ... */ })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      localStorage.setItem('userId', data.userId); // 💾 сохраняем ID
      window.location.href = 'game.html';          // переход в игру
    } else {
      alert(data.message);
    }
  });

registerForm.addEventListener('submit', function(e) {
const password = document.getElementById('registerPassword').value;
const confirmPassword = document.getElementById('registerConfirmPassword').value;
if (password !== confirmPassword) {
    e.preventDefault();
    alert('Passwords do not match.');
}
});