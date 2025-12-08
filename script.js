document.addEventListener('DOMContentLoaded', () => {
  // Register form handler
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const first = document.getElementById('first-name')?.value || '';
      const last = document.getElementById('last-name')?.value || '';
      const name = (first + ' ' + last).trim();
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const confirm = document.getElementById('confirm-password').value;
      if (!name || !email || !password) {
        alert('Lütfen tüm alanları doldurun');
        return;
      }
      if (password !== confirm) {
        alert('Şifreler eşleşmiyor');
        return;
      }

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role: 'user' })
        });
        const data = await res.json();
        const msgEl = document.getElementById('message') || document.createElement('div');
        msgEl.id = 'message';
        if (!document.getElementById('message')) registerForm.parentNode.appendChild(msgEl);
        if (data.success) {
          msgEl.textContent = data.message || 'Kayıt başarılı';
          msgEl.style.color = 'green';
        } else {
          msgEl.textContent = data.message || 'Kayıt gerçekleştirilemedi';
          msgEl.style.color = 'red';
        }
      } catch (err) {
        alert('Kayıt sırasında hata oluştu');
        console.error(err);
      }
    });
  }

  // Login form handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      if (!email || !password) {
        alert('Lütfen e-posta ve şifrenizi girin.');
        return;
      }
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          alert(data.message || 'Giriş başarılı');
          window.location.href = 'index.html';
        } else {
          alert(data.message || 'Giriş başarısız');
        }
      } catch (err) {
        alert('Giriş sırasında hata oluştu');
        console.error(err);
      }
    });
  }
});
