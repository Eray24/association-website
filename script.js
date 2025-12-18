// LocalStorage tabanlı kullanıcı ve oturum yönetimi (backend yok)
// Admin hesabını doğrudan tanımla (async await sorunu çözmek için)
(async () => {
  const getUsers = () => {
    try {
      return JSON.parse(localStorage.getItem("users") || "[]");
    } catch {
      return [];
    }
  };

  const setUsers = (users) => {
    localStorage.setItem("users", JSON.stringify(users));
  };

  // Admin hesabını initialize et
  const hashPassword = async (pw) => {
    const enc = new TextEncoder().encode(pw);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    const arr = Array.from(new Uint8Array(buf));
    return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const users = getUsers();
  if (users.length === 0) {
    // Önceden hesaplanmış hash: SHA-256("admin123")
    const adminPwHash =
      "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f1979c75d";
    const demoUsers = [
      {
        firstName: "Admin",
        lastName: "Kullanıcı",
        email: "admin@dernek.org",
        passwordHash: adminPwHash,
        phone: "",
        birthDate: "",
        interests: "",
        newsletter: false,
        role: "admin",
        createdAt: new Date().toISOString(),
      },
    ];
    setUsers(demoUsers);
  }

  // DOMContentLoaded olduktan sonra form işlemleri
  document.addEventListener("DOMContentLoaded", () => {
    const setSessionUser = (user) => {
      sessionStorage.setItem("user", JSON.stringify(user));
    };

    const getSessionUser = () => {
      const raw = sessionStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    };

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("user");
        alert("Çıkış yapıldı");
        window.location.href = "index.html";
      });
    }

    // Rol kontrol fonksiyonları
    const isAdmin = (user) => user && user.role === "admin";
    const isMember = (user) => user && user.role === "member";

    // Admin paneli görünürlüğü
    const adminSections = document.querySelectorAll("[data-admin-only]");
    const memberSections = document.querySelectorAll("[data-member-only]");
    const su = getSessionUser();
    adminSections.forEach((el) => {
      el.style.display = isAdmin(su) ? "block" : "none";
    });
    memberSections.forEach((el) => {
      el.style.display = isMember(su) || isAdmin(su) ? "block" : "none";
    });

    // Navbar ve çıkış butonu yönetimi
    const userLoginBtn = document.getElementById("userLoginBtn");
    const userLogoutBtn = document.getElementById("userLogoutBtn");

    console.log("Session user:", su);
    console.log("Is admin:", su ? isAdmin(su) : false);
    console.log("userLoginBtn element:", userLoginBtn);
    console.log("userLogoutBtn element:", userLogoutBtn);

    if (su && isAdmin(su)) {
      console.log("Admin login detected!");
      // Admin girişi: Navbar'da taç + isim göster
      if (userLoginBtn) {
        userLoginBtn.innerHTML = `<span style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 18px;">👑</span>
          <span>${su.firstName}</span>
        </span>`;
        userLoginBtn.href = "#";
        userLoginBtn.style.background =
          "linear-gradient(135deg, #ffd700, #ffed4e)";
        userLoginBtn.style.color = "#854d0e";
        userLoginBtn.style.fontWeight = "700";
        userLoginBtn.style.padding = "10px 16px";
        userLoginBtn.style.borderRadius = "8px";
        userLoginBtn.style.boxShadow = "0 4px 15px rgba(255, 215, 0, 0.3)";
      }

      // Ayrı logout butonu oluştur
      const logoutBtn = document.createElement("button");
      logoutBtn.id = "logoutNavBtn";
      logoutBtn.style.display = "inline-flex";
      logoutBtn.style.alignItems = "center";
      logoutBtn.style.justifyContent = "center";
      logoutBtn.style.width = "36px";
      
      logoutBtn.style.cursor = "pointer";
      logoutBtn.style.background = "transparent";
      logoutBtn.style.border = "none";
      logoutBtn.style.color = "#1f2937";
      logoutBtn.style.transition = "all 0.3s";
      logoutBtn.title = "Çıkış Yap";
      logoutBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>`;
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        sessionStorage.removeItem("user");
        alert("Çıkış yapıldı");
        window.location.reload();
      });
      logoutBtn.addEventListener("mouseover", () => {
        logoutBtn.style.background = "rgba(0,0,0,0.05)";
        logoutBtn.style.borderRadius = "6px";
      });
      logoutBtn.addEventListener("mouseout", () => {
        logoutBtn.style.background = "transparent";
      });
      if (userLoginBtn && userLoginBtn.parentNode) {
        userLoginBtn.parentNode.insertBefore(logoutBtn, userLoginBtn.nextSibling);
      }
<<<<<<< HEAD
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
=======
    } else if (su) {
      console.log("Member login detected!");
      // Normal üye girişi: İsim göster
      if (userLoginBtn) {
        userLoginBtn.innerHTML = `<span style="display: flex; align-items: center; gap: 6px;">
          <span>👤</span>
          <span>${su.firstName}</span>
        </span>`;
        userLoginBtn.href = "#";
        userLoginBtn.style.padding = "10px 16px";
        userLoginBtn.style.borderRadius = "8px";
      }

      // Ayrı logout butonu oluştur
      const logoutBtn = document.createElement("button");
      logoutBtn.id = "logoutNavBtn";
      logoutBtn.style.display = "inline-flex";
      logoutBtn.style.alignItems = "center";
      logoutBtn.style.justifyContent = "center";
      logoutBtn.style.width = "36px";
      
      logoutBtn.style.cursor = "pointer";
      logoutBtn.style.background = "transparent";
      logoutBtn.style.border = "none";
      logoutBtn.style.color = "#1f2937";
      logoutBtn.style.transition = "all 0.3s";
      logoutBtn.title = "Çıkış Yap";
      logoutBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>`;
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        sessionStorage.removeItem("user");
        alert("Çıkış yapıldı");
        window.location.reload();
      });
      logoutBtn.addEventListener("mouseover", () => {
        logoutBtn.style.background = "rgba(0,0,0,0.05)";
        logoutBtn.style.borderRadius = "6px";
      });
      logoutBtn.addEventListener("mouseout", () => {
        logoutBtn.style.background = "transparent";
      });
      if (userLoginBtn && userLoginBtn.parentNode) {
        userLoginBtn.parentNode.insertBefore(logoutBtn, userLoginBtn.nextSibling);
      }
    }

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const firstName = document.getElementById("first-name")?.value || "";
        const lastName = document.getElementById("last-name")?.value || "";
        const email = document.getElementById("register-email")?.value || "";
        const password =
          document.getElementById("register-password")?.value || "";
        const confirm =
          document.getElementById("confirm-password")?.value || "";
        const phone = document.getElementById("phone")?.value || "";
        const birthDate = document.getElementById("birth-date")?.value || "";
        const interests = document.getElementById("interests")?.value || "";
        const newsletter =
          document.getElementById("newsletter")?.checked || false;

        if (!firstName || !lastName || !email || !password) {
          alert("Lütfen zorunlu alanları doldurun");
          return;
        }
        if (password !== confirm) {
          alert("Şifreler eşleşmiyor");
          return;
        }

        const users = getUsers();
        if (users.some((u) => u.email === email)) {
          alert("Bu e-posta ile zaten kayıtlı bir kullanıcı var");
          return;
        }

        const passwordHash = await hashPassword(password);
        const newUser = {
          firstName,
          lastName,
          email,
          passwordHash,
          phone,
          birthDate,
          interests,
          newsletter,
          role: "member",
          createdAt: new Date().toISOString(),
        };
        users.push(newUser);
        setUsers(users);

        alert("Kayıt başarılı");
        window.location.href = "login.html";
      });
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      // Admin kullanıcısını garantiye almak için yardımcı fonksiyon
      const ensureAdminExists = () => {
        const users = getUsers();
        const exists = users.some((u) => u.email === "admin@dernek.org");
        if (!exists) {
          const adminPwHash =
            "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f1979c75d";
          users.push({
            firstName: "Admin",
            lastName: "Kullanıcı",
            email: "admin@dernek.org",
            passwordHash: adminPwHash,
            phone: "",
            birthDate: "",
            interests: "",
            newsletter: false,
            role: "admin",
            createdAt: new Date().toISOString(),
          });
          setUsers(users);
        }
      };

      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email")?.value || "";
        const password = document.getElementById("password")?.value || "";
        if (!email || !password) {
          alert("Lütfen e-posta ve şifrenizi girin.");
          return;
        }
        // Admin bypass'ı önce çalıştır (kayıt olmasa bile)
        if (email === "admin@dernek.org" && password === "admin123") {
          ensureAdminExists();
          const admin = getUsers().find((u) => u.email === "admin@dernek.org");
          setSessionUser({
            email: admin?.email || "admin@dernek.org",
            firstName: admin?.firstName || "Admin",
            lastName: admin?.lastName || "Kullanıcı",
            role: admin?.role || "admin",
          });
          alert("Giriş başarılı");
          window.location.href = "index.html";
          return;
        }

        const users = getUsers();
        const candidate = users.find((u) => u.email === email);
        if (!candidate) {
          alert("Kullanıcı bulunamadı");
          return;
        }

        const passwordHash = await hashPassword(password);
        if (candidate.passwordHash !== passwordHash) {
          console.log("Girilen hash:", passwordHash);
          console.log("Saklanan hash:", candidate.passwordHash);
          alert("Şifre hatalı");
          return;
        }

        setSessionUser({
          email: candidate.email,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          role: candidate.role,
        });
        alert("Giriş başarılı");
        window.location.href = "index.html";
      });
    }

    // Korunan sayfalar ve rol kontrolleri
    const pageRoles = {};
    const path = location.pathname.split("/").pop();
    if (pageRoles[path]) {
      const su = getSessionUser();
      if (!su) {
        alert("Bu sayfa için giriş yapmalısınız");
        window.location.href = "login.html";
      } else if (!pageRoles[path].includes(su.role)) {
        alert(
          "Bu sayfa erişimi yalnızca " +
            pageRoles[path].join("/") +
            " rolü için açıktır"
        );
        window.location.href = "index.html";
      }
    }
  });
})();
>>>>>>> 067a523c25989e24a7cb98f3c67ba17c35b64c56
