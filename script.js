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
    const logoutBtnMember = document.getElementById("logoutBtnMember");
    if (logoutBtnMember) {
      logoutBtnMember.addEventListener("click", () => {
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
    const currentPage = location.pathname.split('/').pop();

    // Duyuru yardımcıları
    const monthNamesShort = [
      "Oca",
      "Şub",
      "Mar",
      "Nis",
      "May",
      "Haz",
      "Tem",
      "Ağu",
      "Eyl",
      "Eki",
      "Kas",
      "Ara",
    ];

    const defaultAnnouncements = [
      {
        title: "Yaz Kamp Başvuruları Açıldı",
        summary:
          "Derneğimizin yıllık yaz kampı için başvurular başlamıştır. Genç üyelerimiz için 2 haftalık bir program hazırlandı.",
        date: "2025-12-07",
        tags: ["Etkinlik", "Gençlik"],
      },
      {
        title: "Yeni Proje: Eğitim İçin Kaynaklar",
        summary:
          "Ücretsiz Python, İngilizce ve dijital pazarlama kursları tüm üyelerimizin başvurusuna açıldı.",
        date: "2025-12-05",
        tags: ["Eğitim", "Program"],
      },
      {
        title: "Aralık Ayı Gönüllülük Faaliyetleri",
        summary:
          "Çevre temizliği, yaşlı bakım evi ziyareti ve yetim öğrencilere ders anlatma aktiviteleri için kayıtlar başladı.",
        date: "2025-12-03",
        tags: ["Gönüllülük", "Sosyal Sorumluluk"],
      },
      {
        title: "Yıl Sonu Genel Kurul Duyurusu",
        summary:
          "15 Ocak 2026'da genel kurul yapılacaktır. Tüm üyeler oy kullanma hakkına sahiptir.",
        date: "2025-11-28",
        tags: ["Yönetim", "Önemli"],
      },
      {
        title: "Haftalık Sosyalleşme Etkinlikleri",
        summary:
          "Her cuma 19:00'da sosyalleşme buluşmaları. Kahve, çay ve sohbet ortamında üyeler bir araya geliyor.",
        date: "2025-11-20",
        tags: ["Sosyal", "Düzenli Etkinlik"],
      },
      {
        title: "Yeni Üyelik Kampanyası",
        summary:
          "Ekim ayında üye olanlara ilk 3 ay özel avantajlar, öncelikli erişim ve etkinlik davetiyesi.",
        date: "2025-11-10",
        tags: ["Üyelik", "Kampanya"],
      },
    ];

    const getDayMonth = (ann) => {
      if (ann?.date) {
        const d = new Date(ann.date);
        if (!Number.isNaN(d.getTime())) {
          return {
            day: String(d.getDate()).padStart(2, "0"),
            month: monthNamesShort[d.getMonth()] || "",
          };
        }
      }
      return {
        day: ann?.day || "--",
        month: ann?.month || "",
      };
    };

    const formatDateLabel = (ann) => {
      if (ann?.date) {
        const d = new Date(ann.date);
        if (!Number.isNaN(d.getTime())) {
          return d.toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        }
      }
      const dm = getDayMonth(ann);
      return `${dm.day} ${dm.month}`.trim();
    };

    const normalizeAnnouncement = (ann) => {
      const safeTags = Array.isArray(ann?.tags)
        ? ann.tags.filter((t) => t && t.trim())
        : [];
      const { day, month } = getDayMonth(ann || {});
      return {
        title: ann?.title || "",
        summary: ann?.summary || ann?.body || "",
        date: ann?.date || "",
        tags: safeTags,
        day,
        month,
      };
    };

    const loadAnnouncements = () => {
      try {
        const raw = localStorage.getItem("announcements");
        const arr = raw ? JSON.parse(raw) : [];
        const base = Array.isArray(arr) && arr.length > 0 ? arr : defaultAnnouncements;
        return base.map((a) => normalizeAnnouncement(a)).sort((a, b) => {
          const da = new Date(a.date || 0).getTime();
          const db = new Date(b.date || 0).getTime();
          return db - da;
        });
      } catch {
        return defaultAnnouncements.map((a) => normalizeAnnouncement(a));
      }
    };

    const saveAnnouncements = (list) => {
      localStorage.setItem("announcements", JSON.stringify(list));
    };

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

    // --- Yönetim sayfası: üye listeleme ve CRUD (admin) ---
    // Skip legacy remote-API team logic on the local `management.html` page
    if (currentPage !== 'management.html') {
      const teamGrid = document.getElementById('team-grid');
      const memberForm = document.getElementById('memberForm');
      const adminPanel = document.getElementById('admin-panel');
      const newMemberBtn = document.getElementById('new-member');
      const cancelMemberBtn = document.getElementById('cancel-member');

      const adminMode = isAdmin(su);

      if (adminPanel) {
        adminPanel.style.display = adminMode ? 'block' : 'none';
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
        if (!adminMode || !teamGrid) return;
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
          if (adminMode) {
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
        if (!adminMode) return alert('Yönetici değilsiniz');
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
        adminPanel.style.display = adminMode ? 'block' : 'none';
      });

      async function load() {
        const members = await fetchMembers();
        renderMembers(members);
      }

      if (teamGrid) load();
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

    // Duyurular sayfası yönetimi (admin CRUD)
    if (currentPage === "announcements.html") {
      const annListEl = document.getElementById("ann-list");
      const annForm = document.getElementById("annForm");
      const annNewBtn = document.getElementById("annNewBtn");
      const annEditIndex = document.getElementById("annEditIndex");
      const annTitle = document.getElementById("annTitle");
      const annDate = document.getElementById("annDate");
      const annBody = document.getElementById("annBody");
      const annTags = document.getElementById("annTags");
      const annCancelBtn = document.getElementById("annCancelBtn");

      let announcements = loadAnnouncements();

      const renderAnnPage = () => {
        if (!annListEl) return;
        const list = [...announcements].sort((a, b) => {
          const da = new Date(a.date || 0).getTime();
          const db = new Date(b.date || 0).getTime();
          return db - da;
        });

        annListEl.innerHTML = list
          .map((ann, idx) => {
            const tagsHtml = (ann.tags || [])
              .map((t) => `<span class="tag">${t}</span>`)
              .join("");
            const dateLabel = formatDateLabel(ann);
            const actions = isAdmin(su)
              ? `<div class="ann-card-actions">
                  <button class="edit-btn" data-idx="${idx}">Düzenle</button>
                  <button class="delete-btn" data-idx="${idx}">Sil</button>
                </div>`
              : "";
            return `<article class="announcement-card">
                <div class="announcement-header">
                  <h3>${ann.title}</h3>
                  <span class="date">${dateLabel}</span>
                </div>
                <p class="announcement-body">${ann.summary}</p>
                <div class="announcement-tags">${tagsHtml}</div>
                ${actions}
              </article>`;
          })
          .join("");

        if (isAdmin(su)) {
          annListEl.querySelectorAll(".edit-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              const idx = Number(btn.dataset.idx);
              const ann = announcements[idx];
              if (!ann) return;
              annEditIndex.value = String(idx);
              annTitle.value = ann.title || "";
              annDate.value = ann.date || "";
              annBody.value = ann.summary || "";
              annTags.value = (ann.tags || []).join(", ");
              if (annForm) annForm.style.display = "block";
              window.scrollTo({ top: annForm.offsetTop - 40, behavior: "smooth" });
            });
          });

          annListEl.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              const idx = Number(btn.dataset.idx);
              if (Number.isNaN(idx)) return;
              const ok = confirm("Bu duyuruyu silmek istiyor musunuz?");
              if (!ok) return;
              announcements.splice(idx, 1);
              saveAnnouncements(announcements);
              renderAnnPage();
            });
          });
        }
      };

      const resetForm = () => {
        annEditIndex.value = "";
        annTitle.value = "";
        annDate.value = "";
        annBody.value = "";
        annTags.value = "";
        if (annForm) annForm.style.display = "none";
      };

      if (annNewBtn && isAdmin(su)) {
        annNewBtn.addEventListener("click", () => {
          resetForm();
          if (annForm) annForm.style.display = "block";
        });
      }

      if (annCancelBtn) {
        annCancelBtn.addEventListener("click", resetForm);
      }

      if (annForm) {
        annForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const title = annTitle?.value.trim();
          const date = annDate?.value || "";
          const summary = annBody?.value.trim();
          const tags = (annTags?.value || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
          if (!title || !date || !summary) {
            alert("Lütfen başlık, tarih ve açıklama alanlarını doldurun.");
            return;
          }

          const { day, month } = getDayMonth({ date });
          const newAnn = {
            title,
            summary,
            date,
            tags,
            day,
            month,
          };

          const idx = annEditIndex.value;
          if (idx !== "" && !Number.isNaN(Number(idx))) {
            announcements[Number(idx)] = newAnn;
          } else {
            announcements.push(newAnn);
          }
          saveAnnouncements(announcements);
          resetForm();
          renderAnnPage();
        });
      }

      renderAnnPage();
    }

    // Duyuru merkezi (yalnızca anasayfa)
    if (currentPage === "" || currentPage === "index.html") {
      const announcementData = loadAnnouncements()
        .sort((a, b) => {
          const da = new Date(a.date || 0).getTime();
          const db = new Date(b.date || 0).getTime();
          return db - da;
        })
        .slice(0, 8)
        .map((a) => {
          const dm = getDayMonth(a);
          return {
            day: dm.day,
            month: dm.month,
            title: a.title,
            summary: a.summary,
            tags: a.tags || [],
          };
        });

      const center = document.getElementById("announcement-center");
      const listEl = document.getElementById("announcement-list");
      if (center && listEl) {
        const upBtn = document.getElementById("ann-up");
        const downBtn = document.getElementById("ann-down");
        const viewport = center.querySelector(".announcement-viewport");

        let itemHeight = 0;
        let autoTimer = null;

        const getItemMarkup = (item) => {
          const tagsHtml = (item.tags || [])
            .map((t) => `<span class=\"ann-tag\">${t}</span>`)
            .join("");
          return `<div class=\"announcement-item\">\
              <div class=\"ann-date\">\
                <div class=\"day\">${item.day}</div>\
                <div class=\"month\">${item.month}</div>\
              </div>\
              <div class=\"ann-content\">\
                <h4>${item.title}</h4>\
                <p>${item.summary}</p>\
                <div class=\"ann-tags\">${tagsHtml}</div>\
              </div>\
            </div>`;
        };

        const buildList = () => {
          if (announcementData.length === 0) {
            listEl.innerHTML = "<div class=\\\"announcement-item\\\"><div class=\\\"ann-content\\\"><h4>Henüz duyuru yok</h4><p>Daha sonra tekrar kontrol edin.</p></div></div>";
            itemHeight = listEl.firstElementChild?.getBoundingClientRect().height || 64;
            return;
          }

          listEl.innerHTML = announcementData.map(getItemMarkup).join("");

          requestAnimationFrame(() => {
            const first = listEl.querySelector(".announcement-item");
            if (first) {
              const style = getComputedStyle(first);
              const mb = parseFloat(style.marginBottom || "0");
              itemHeight = first.getBoundingClientRect().height + mb;
            }
          });
        };

        const goNext = () => {
          if (listEl.children.length <= 1 || itemHeight === 0) return;
          listEl.style.transition = "transform 0.45s ease";
          listEl.style.transform = `translateY(-${itemHeight}px)`;

          const handle = () => {
            listEl.removeEventListener("transitionend", handle);
            listEl.appendChild(listEl.firstElementChild);
            listEl.style.transition = "none";
            listEl.style.transform = "translateY(0)";
            requestAnimationFrame(() => {
              listEl.style.transition = "transform 0.45s ease";
            });
          };
          listEl.addEventListener("transitionend", handle);
        };

        const startAuto = () => {
          clearInterval(autoTimer);
          autoTimer = setInterval(() => {
            goNext();
          }, 2600);
        };

        const pauseAuto = () => {
          clearInterval(autoTimer);
        };

        if (upBtn) {
          upBtn.addEventListener("click", () => {
            goNext();
            startAuto();
          });
        }

        if (downBtn) {
          downBtn.addEventListener("click", () => {
            goNext();
            startAuto();
          });
        }

        if (viewport) {
          viewport.addEventListener("mouseenter", pauseAuto);
          viewport.addEventListener("mouseleave", startAuto);
        }

        buildList();
        startAuto();
      }
    }

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
    // Tema toggle (tüm sayfalarda çalışacak)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
    }
    
    // Tema toggle butonu
    const toggleBtnInit = document.getElementById('theme-toggle');
    if (toggleBtnInit) {
      // Icon'u güncelle
      if (document.body.classList.contains('dark')) {
        toggleBtnInit.textContent = '☀️';
      } else {
        toggleBtnInit.textContent = '🌙';
      }
      
      toggleBtnInit.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        
        if (document.body.classList.contains('dark')) {
          toggleBtnInit.textContent = '☀️';
          localStorage.setItem('theme', 'dark');
        } else {
          toggleBtnInit.textContent = '🌙';
          localStorage.setItem('theme', 'light');
        }
      });
    }
  });
})();
