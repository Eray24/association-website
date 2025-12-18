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

  // --- Yönetim sayfası: üye listeleme ve CRUD (admin) ---
  const teamGrid = document.getElementById('team-grid');
  const memberForm = document.getElementById('memberForm');
  const adminPanel = document.getElementById('admin-panel');
  const newMemberBtn = document.getElementById('new-member');
  const cancelMemberBtn = document.getElementById('cancel-member');

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user && user.role === 'admin';

  if (adminPanel) {
    adminPanel.style.display = isAdmin ? 'block' : 'none';
  }

  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  async function fetchMembers() {
    try {
      const res = await fetch('/api/members');
      const data = await res.json().catch(() => null);
      if (res.ok && Array.isArray(data.members)) return data.members;
      return [];
    } catch (err) {
      console.error('fetchMembers error', err);
      return [];
    }
  }

  function attachHandlers() {
    if (!isAdmin || !teamGrid) return;
    teamGrid.querySelectorAll('button.edit').forEach((b) => {
      b.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const members = await fetchMembers();
        const m = members.find((x) => String(x.id) === String(id));
        if (!m) return alert('Üye bulunamadı');
        document.getElementById('member-id').value = m.id;
        document.getElementById('member-name').value = m.name || '';
        document.getElementById('member-position').value = m.position || '';
        document.getElementById('member-bio').value = m.bio || '';
        document.getElementById('member-contact').value = m.contact || '';
        adminPanel.style.display = 'block';
      });
    });

    teamGrid.querySelectorAll('button.delete').forEach((b) => {
      b.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (!confirm('Üyeyi silmek istediğinize emin misiniz?')) return;
        try {
          const res = await fetch('/api/members/' + id, { method: 'DELETE' });
          if (res.ok) {
            alert('Üye silindi');
            load();
          } else {
            const d = await res.json().catch(() => null);
            alert(d?.message || 'Silinemedi');
          }
        } catch (err) {
          console.error(err);
          alert('Sunucu hatası');
        }
      });
    });
  }

  function renderMembers(members) {
    if (!teamGrid) return;
    teamGrid.innerHTML = '';
    members.forEach((m) => {
      const div = document.createElement('div');
      div.className = 'team-member';
      div.innerHTML = `
        <div class="member-avatar">👤</div>
        <h3>${escapeHtml(m.name)}</h3>
        <p class="position">${escapeHtml(m.position || '')}</p>
        <p class="bio">${escapeHtml(m.bio || '')}</p>
        <p class="contact">${escapeHtml(m.contact || '')}</p>
      `;
      if (isAdmin) {
        const controls = document.createElement('div');
        controls.className = 'member-controls';
        controls.innerHTML = `<button class="edit" data-id="${m.id}">Düzenle</button> <button class="delete" data-id="${m.id}">Sil</button>`;
        div.appendChild(controls);
      }
      teamGrid.appendChild(div);
    });
    attachHandlers();
  }

  memberForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert('Yönetici değilsiniz');
    const id = document.getElementById('member-id').value;
    const payload = {
      name: document.getElementById('member-name').value,
      position: document.getElementById('member-position').value,
      bio: document.getElementById('member-bio').value,
      contact: document.getElementById('member-contact').value,
    };
    try {
      let res;
      if (id) {
        res = await fetch('/api/members/' + id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (res.ok) {
        alert('Kaydedildi');
        document.getElementById('member-id').value = '';
        memberForm.reset();
        load();
      } else {
        const d = await res.json().catch(() => null);
        alert(d?.message || 'Kaydedilemedi');
      }
    } catch (err) {
      console.error(err);
      alert('Sunucu hatası');
    }
  });

  newMemberBtn?.addEventListener('click', () => {
    document.getElementById('member-id').value = '';
    memberForm.reset();
    adminPanel.style.display = 'block';
  });

  cancelMemberBtn?.addEventListener('click', () => {
    document.getElementById('member-id').value = '';
    memberForm.reset();
    adminPanel.style.display = isAdmin ? 'block' : 'none';
  });

  async function load() {
    const members = await fetchMembers();
    renderMembers(members);
  }

  if (teamGrid) load();
});
