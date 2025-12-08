// Client-side register/login handlers that call the server API
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const firstName = document.getElementById('first-name')?.value || '';
      const lastName = document.getElementById('last-name')?.value || '';
      const email = document.getElementById('register-email')?.value || '';
      const password = document.getElementById('register-password')?.value || '';
      const confirm = document.getElementById('confirm-password')?.value || '';
      const phone = document.getElementById('phone')?.value || '';
      const birthDate = document.getElementById('birth-date')?.value || '';
      const interests = document.getElementById('interests')?.value || '';
      const newsletter = document.getElementById('newsletter')?.checked || false;

      if (!firstName || !lastName || !email || !password) {
        alert('Lütfen zorunlu alanları doldurun');
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
          body: JSON.stringify({ firstName, lastName, email, password, phone, birthDate, interests, newsletter })
        });

        const data = await res.json().catch(() => null);
        if (res.ok && data && data.success) {
          alert(data.message || 'Kayıt başarılı');
          window.location.href = 'login.html';
        } else if (data && data.message) {
          alert(data.message);
        } else {
          alert('Kayıt gerçekleştirilemedi — sunucu yanıtı alınamadı');
        }
      } catch (err) {
        console.error(err);
        alert('Kayıt sırasında hata oluştu — sunucuya bağlanılamadı');
      }
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email')?.value || '';
      const password = document.getElementById('password')?.value || '';
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
        const data = await res.json().catch(() => null);
        if (res.ok && data && data.success) {
          localStorage.setItem('user', JSON.stringify(data.user));
          alert(data.message || 'Giriş başarılı');
          window.location.href = 'index.html';
        } else if (data && data.message) {
          alert(data.message);
        } else {
          alert('Giriş başarısız — sunucu yanıtı alınamadı');
        }
      } catch (err) {
        console.error(err);
        alert('Giriş sırasında hata oluştu — sunucuya bağlanılamadı');
      }
    });
  }
});
