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

    // ==================== BAĞIŞ SİSTEMİ BAŞLANGIÇ ====================
    // LocalStorage'da bağış bilgilerini sakla ve oku
    const DONATION_KEY = 'totalDonations';
    const DONATION_GOAL = 1000000; // 1 milyon TL
    
    // Mevcut toplam bağış miktarını al
    const getDonationAmount = () => {
      const stored = localStorage.getItem(DONATION_KEY);
      return stored ? parseFloat(stored) : 0;
    };
    
    // Yeni bağış ekle
    const addDonation = (amount) => {
      const currentAmount = getDonationAmount();
      const newAmount = currentAmount + parseFloat(amount);
      localStorage.setItem(DONATION_KEY, newAmount.toString());
      return newAmount;
    };
    
    // Ana sayfadaki bağış göstergesini güncelle
    const updateDonationProgress = () => {
      const progressContainer = document.getElementById('donation-progress');
      if (!progressContainer) return;
      
      const currentAmount = getDonationAmount();
      const goal = DONATION_GOAL;
      const percentage = Math.min((currentAmount / goal) * 100, 100);
      
      // Sayıları formatla (örn: 123456 -> 123.456)
      const formatNumber = (num) => {
        return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      };
      
      // HTML güncellemeleri
      const amountsEl = progressContainer.querySelector('.dp-amounts');
      const fillEl = progressContainer.querySelector('.dp-fill');
      const percentEl = progressContainer.querySelector('.dp-percent');
      const barEl = progressContainer.querySelector('.dp-bar');
      
      if (amountsEl) {
        amountsEl.innerHTML = `<strong>${formatNumber(currentAmount)}₺</strong> / ${formatNumber(goal)}₺`;
      }
      
      if (fillEl) {
        fillEl.style.width = `${percentage}%`;
      }
      
      if (percentEl) {
        percentEl.textContent = `${Math.floor(percentage)}%`;
      }
      
      if (barEl) {
        barEl.setAttribute('aria-valuenow', Math.floor(percentage));
      }
      
      // data-current attribute'u da güncelle
      progressContainer.setAttribute('data-current', currentAmount);
    };
    
    // Sayfa yüklendiğinde bağış durumunu güncelle (index.html için)
    updateDonationProgress();
    // ==================== BAĞIŞ SİSTEMİ BİTİŞ ====================

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
    const currentPage = location.pathname.split('/').pop() || 'index.html';

    // Admin olmayanları bağış yönetim sayfasından uzaklaştır
    if (currentPage === 'donation-management.html' && !isAdmin(su)) {
      alert('Bu sayfa sadece yönetici girişi ile görüntülenebilir.');
      window.location.href = 'login.html';
      return;
    }

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
          "Derneğimizin yıllık yaz kampı için başvurular başlamıştır. Genç üyelerimiz için 2 haftalık bir program hazırlandı. Kampda doğa yürüyüşleri, spor aktiviteleri, sanat atölyeleri ve kamp ateşi etkinlikleri yer alacaktır. Tüm barınma ve yemek giderleri dernek tarafından karşılanacaktır. Başvuru için iletişim formunu doldurun ya da dernek yöneticilerine başvurun. Başvuru süresi 30 Aralık 2025'e kadardir. Sınırlı sayıda yer mevcuttur.",
        date: "2025-12-07",
        tags: ["Etkinlik", "Gençlik"],
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
      },
      {
        title: "Yeni Proje: Eğitim İçin Kaynaklar",
        summary:
          "Ücretsiz Python, İngilizce ve dijital pazarlama kursları tüm üyelerimizin başvurusuna açıldı. Bu kurslar uzman eğitmenlerce hazırlanmış olup, online ve yüz yüze olarak sunulacaktır. Python kursu 8 hafta, İngilizce kursu 12 hafta ve dijital pazarlama kursu 6 hafta sürecektir. Kurslar tamamlandıktan sonra katılımcılara sertifikat verilecektir. Başvuru için adınız, soyadınız ve tercih ettiğiniz kurs ismini iletişim formu aracılığıyla gönderin. Bu proje, gençlerin iş piyasasına hazırlanmasını hedeflemektedir.",
        date: "2025-12-05",
        tags: ["Eğitim", "Program"],
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
      },
      {
        title: "Aralık Ayı Gönüllülük Faaliyetleri",
        summary:
          "Çevre temizliği, yaşlı bakım evi ziyareti ve yetim öğrencilere ders anlatma aktiviteleri için kayıtlar başladı. Çevre temizliği projesi her pazartesi sabah 09:00'da gerçekleştirilecektir. Yaşlı bakım evi ziyaretleri çarşamba öğleden sonra saat 14:00'de yapılacak olup, misafirleri sevindirmek için konservatuar öğrencilerimiz müzik performansı sunacaktır. Yetim öğrencilere ders anlatmak isteyen gönüllüler matematik, fizik, kimya ve İngilizce derslerini verebilirler. Aktivitelere katılım tamamen gönüllü ve ücretsizdir.",
        date: "2025-12-03",
        tags: ["Gönüllülük", "Sosyal Sorumluluk"],
        image: "https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=600&h=400&fit=crop&q=80",
      },
      {
        title: "Yıl Sonu Genel Kurul Duyurusu",
        summary:
          "15 Ocak 2026'da genel kurul yapılacaktır. Tüm üyeler oy kullanma hakkına sahiptir. Genel kurulda dernek yönetiminin 2025 yılı faaliyet raporu sunulacak ve 2026 yılı bütçesi görüşülecektir. Ayrıca yönetim kurulu seçimleri gerçekleştirilecektir. Toplantı saat 19:00'da dernek merkezinde başlayacaktır. Katılmak isteyen tüm üyeler lütfen öncesinde kayıt yaptırsınlar. Çevrimiçi katılım da mümkün olacaktır.",
        date: "2025-11-28",
        tags: ["Yönetim", "Önemli"],
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
      },
      {
        title: "Haftalık Sosyalleşme Etkinlikleri",
        summary:
          "Her cuma 19:00'da sosyalleşme buluşmaları. Kahve, çay ve sohbet ortamında üyeler bir araya geliyor. Bu buluşmalar dernek merkezinin bahçesinde yapılmaktadır. Üyelerimiz burada yeni insanlar tanıyabilir, fikir paylaşabilir ve sosyal ağını genişletebilir. Bazı haftalar özel konuşmacılar davet edilmektedir. Üyelik kartı getirmek gerekmektedir. Davetiye gerekmez, tüm üyeler hoş geldiniz.",
        date: "2025-11-20",
        tags: ["Sosyal", "Düzenli Etkinlik"],
        image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop",
      },
      {
        title: "Yeni Üyelik Kampanyası",
        summary:
          "Ekim ayında üye olanlara ilk 3 ay özel avantajlar, öncelikli erişim ve etkinlik davetiyesi. Bu kampanya dahilinde yeni üyeler tüm etkinliklere ücretsiz katılabilecekler, dernek kütüphanesine sınırsız erişim sağlanacak ve ayda bir kişisel gelişim semineri almaya hak kazanacaklardır. Ayrıca dernek yayınlarının abone süresi 3 ay uzatılacaktır. Bu fırsat kaçmadan derneğimize katıl, dayanışma ağımızın bir parçası ol.",
        date: "2025-11-10",
        tags: ["Üyelik", "Kampanya"],
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
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
        image: ann?.image || "",
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

      // Ana sayfada Bağış Yap butonunun yanına yönetim bağlantısını ekle
      if (currentPage === '' || currentPage === 'index.html') {
        const donateBtn = document.querySelector('.hero .buttons a[href="donate.html"]');
        const existingManageBtn = document.querySelector('.hero .buttons a[href="donation-management.html"]');
        if (donateBtn && !existingManageBtn) {
          const manageBtn = document.createElement('a');
          manageBtn.href = 'donation-management.html';
          manageBtn.className = donateBtn.className || 'primary';
          manageBtn.textContent = 'Bağış Yönetim';
          manageBtn.style.marginLeft = '8px';
          donateBtn.insertAdjacentElement('afterend', manageBtn);
        }
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
            const thumbnailHtml = ann.image
              ? `<img src="${ann.image}" alt="${ann.title}" class="announcement-thumbnail" />`
              : `<div class="announcement-thumbnail placeholder">📰</div>`;
            const baseUrl = (location.protocol === 'http:' || location.protocol === 'https:')
              ? (location.origin + '/announcements.html')
              : '';
            const shareText = `${ann.title}\n\n${ann.summary}` + (baseUrl ? `\n\n${baseUrl}` : '');
            const waUrl = `https://api.whatsapp.com/send/?text=${encodeURIComponent(shareText)}`;
            const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

            const actions = isAdmin(su)
              ? `<div class="ann-card-actions">
                  <button class="edit-btn" data-idx="${idx}">Düzenle</button>
                  <button class="delete-btn" data-idx="${idx}">Sil</button>
                </div>`
              : "";
            return `<article class="announcement-card" data-idx="${idx}" role="button" tabindex="0">
                ${thumbnailHtml}
                <div>
                  <div class="announcement-header">
                    <h3>${ann.title}</h3>
                    <span class="date">${dateLabel}</span>
                  </div>
                  <p class="announcement-body">${ann.summary}</p>
                  <div class="announcement-tags">${tagsHtml}</div>
                  <div class="ann-share" onclick="event.stopPropagation();">
                    <a class="share-btn whatsapp" href="${waUrl}" target="_blank" rel="noopener" aria-label="WhatsApp" title="WhatsApp"><span class="sr-only">WhatsApp</span></a>
                    <button class="share-btn instagram" data-idx="${idx}" type="button" aria-label="Instagram" title="Instagram"><span class="sr-only">Instagram</span></button>
                    <a class="share-btn x" href="${xUrl}" target="_blank" rel="noopener" aria-label="X" title="X"><span class="sr-only">X</span></a>
                  </div>
                  ${actions}
                </div>
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
              document.getElementById("annImage").value = ann.image || "";
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

        // Instagram paylaşım: metni panoya kopyala ve instagram.com'a yönlendir
        annListEl.querySelectorAll('.share-btn.instagram').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = Number(btn.dataset.idx);
            const ann = announcements[idx];
            if (!ann) return;
            const text = `${ann.title}\n\n${ann.summary}`; // URL eklemeyelim (file:// sızıntısını engelle)
            const openIg = () => window.open('https://www.instagram.com/', '_blank');
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(text).then(openIg).catch(openIg);
            } else {
              openIg();
            }
          });
        });

        // Announcement Modal
        const announcementModal = document.getElementById('announcementModal');
        if (announcementModal) {
          const modalClose = announcementModal.querySelector('.modal-close');
          
          // Modal kapatma
          if (modalClose) {
            modalClose.addEventListener('click', () => {
              announcementModal.style.display = 'none';
            });
          }

          window.addEventListener('click', (e) => {
            if (e.target === announcementModal) {
              announcementModal.style.display = 'none';
            }
          });

          // Kart tıklaması
          annListEl.querySelectorAll('.announcement-card').forEach((card) => {
            card.addEventListener('click', (e) => {
              // Eğer paylaş butonuna tıklanmışsa modal açma
              if (e.target.closest('.ann-share') || e.target.closest('.ann-card-actions')) {
                return;
              }

              const idx = Number(card.dataset.idx);
              const ann = announcements[idx];
              if (!ann) return;

              // Modal içeriğini doldur
              document.getElementById('announcementModalTitle').textContent = ann.title;
              document.getElementById('announcementModalDate').textContent = formatDateLabel(ann);
              
              // Görsel
              const imageEl = document.getElementById('announcementModalImage');
              if (ann.image) {
                imageEl.innerHTML = `<img src="${ann.image}" alt="${ann.title}" style="width:100%; border-radius:12px; object-fit:cover; max-height:400px;" />`;
              } else {
                imageEl.innerHTML = `<div style="width:100%; height:300px; background:#f3f4f6; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:64px;">📰</div>`;
              }

              // Etiketler
              const tagsDiv = document.getElementById('announcementModalTags');
              if (ann.tags && ann.tags.length > 0) {
                tagsDiv.innerHTML = ann.tags.map(t => `<span class="tag">${t}</span>`).join('');
              } else {
                tagsDiv.innerHTML = '';
              }

              // Metin
              document.getElementById('announcementModalText').textContent = ann.summary;

              // Paylaş butonları
              const baseUrl = (location.protocol === 'http:' || location.protocol === 'https:')
                ? (location.origin + '/announcements.html')
                : '';
              const shareText = `${ann.title}\n\n${ann.summary}` + (baseUrl ? `\n\n${baseUrl}` : '');
              const waUrl = `https://api.whatsapp.com/send/?text=${encodeURIComponent(shareText)}`;
              const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

              const shareHtml = `
                <div class="ann-share">
                  <a class="share-btn whatsapp" href="${waUrl}" target="_blank" rel="noopener" aria-label="WhatsApp" title="WhatsApp"><span class="sr-only">WhatsApp</span></a>
                  <button class="share-btn instagram" data-idx="${idx}" type="button" aria-label="Instagram" title="Instagram"><span class="sr-only">Instagram</span></button>
                  <a class="share-btn x" href="${xUrl}" target="_blank" rel="noopener" aria-label="X" title="X"><span class="sr-only">X</span></a>
                </div>
              `;
              document.getElementById('announcementModalShare').innerHTML = shareHtml;

              // Instagram butonu için event listener ekle
              document.querySelector('#announcementModalShare .share-btn.instagram').addEventListener('click', () => {
                const text = `${ann.title}\n\n${ann.summary}`;
                const openIg = () => window.open('https://www.instagram.com/', '_blank');
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(text).then(openIg).catch(openIg);
                } else {
                  openIg();
                }
              });

              // Modal aç
              announcementModal.style.display = 'flex';
            });

            // Keyboard erişilebilirliği
            card.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
              }
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
          const image = document.getElementById("annImage")?.value.trim() || "";
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
            image,
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
      // Donation progress (hero) init
      const dp = document.getElementById("donation-progress");
      if (dp) {
        const current = Number(dp.dataset.current || 0);
        const goal = Number(dp.dataset.goal || 100);
        const pct = goal > 0 ? Math.min(100, Math.max(0, Math.round((current / goal) * 100))) : 0;
        const fill = dp.querySelector('.dp-fill');
        const bar = dp.querySelector('.dp-bar');
        const percentEl = dp.querySelector('.dp-percent');
        if (fill) fill.style.width = pct + '%';
        if (bar) bar.setAttribute('aria-valuenow', String(pct));
        if (percentEl) percentEl.textContent = pct + '%';
      }

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
            image: a.image || "",
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

        const updateViewportHeight = () => {
          if (!viewport) return;
          const h = computeItemHeight();
          if (h > 0) {
            // 3 duyuru görünecek şekilde yüksekliği sabitle
            viewport.style.height = `${Math.round(h * 3)}px`;
          }
        };

        const getItemMarkup = (item) => {
          const tagsHtml = (item.tags || [])
            .map((t) => `<span class=\"ann-tag\">${t}</span>`)
            .join("");
          const thumbnailHtml = item.image
            ? `<img src="${item.image}" alt="${item.title}" class=\"ann-thumbnail\" />`
            : `<div class=\"ann-thumbnail placeholder\">📰</div>`;
          return `<div class=\"announcement-item\">\
              ${thumbnailHtml}\
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

        const computeItemHeight = () => {
          const first = listEl.firstElementChild;
          if (!first) return itemHeight || 0;
          const style = getComputedStyle(first);
          const mb = parseFloat(style.marginBottom || "0");
          return first.getBoundingClientRect().height + mb;
        };

        const buildList = () => {
          if (announcementData.length === 0) {
            listEl.innerHTML = "<div class=\\\"announcement-item\\\"><div class=\\\"ann-content\\\"><h4>Henüz duyuru yok</h4><p>Daha sonra tekrar kontrol edin.</p></div></div>";
            itemHeight = listEl.firstElementChild?.getBoundingClientRect().height || 64;
            return;
          }

          listEl.innerHTML = announcementData.map(getItemMarkup).join("");

          requestAnimationFrame(() => {
            itemHeight = computeItemHeight();
            updateViewportHeight();
          });
        };

        const goNext = () => {
          const moveHeight = computeItemHeight();
          if (listEl.children.length <= 1 || moveHeight === 0) return;
          listEl.style.transition = "transform 0.45s ease";
          listEl.style.transform = `translateY(-${moveHeight}px)`;

          const handle = () => {
            listEl.removeEventListener("transitionend", handle);
            listEl.appendChild(listEl.firstElementChild);
            listEl.style.transition = "none";
            listEl.style.transform = "translateY(0)";
            itemHeight = computeItemHeight();
            updateViewportHeight();
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

        // Resize olduğunda öğe yüksekliği değişebilir
        window.addEventListener("resize", () => {
          itemHeight = computeItemHeight();
          updateViewportHeight();
        });
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

    // Site Arama Fonksiyonalitesi
    const siteSearchInput = document.getElementById('site-search');
    const searchResultsDiv = document.getElementById('search-results');

    if (siteSearchInput && searchResultsDiv) {
      const searchableContent = [
        // Duyurular - localStorage'dan yüklenecek
        // Faaliyetler
        { title: 'Eğitim Desteği', summary: 'Maddi imkanı kısıtlı öğrencilere burs ve eğitim materyali desteği', category: 'Faaliyetlerimiz', url: 'activities.html#egitim' },
        { title: 'Sağlık Yardımı', summary: 'İhtiyaç sahibi ailelere ilaç ve tedavi desteği sağlanması', category: 'Faaliyetlerimiz', url: 'activities.html#saglik' },
        { title: 'Gıda Yardımı', summary: 'Düzenli gıda kolisi ve sıcak yemek dağıtımı programı', category: 'Faaliyetlerimiz', url: 'activities.html#gida' },
        { title: 'Kültür ve Sanat', summary: 'Toplumsal kültür ve sanat etkinlikleri düzenlenmesi', category: 'Faaliyetlerimiz', url: 'activities.html#kultur' },
        { title: 'Çevre Projeleri', summary: 'Ağaçlandırma ve çevre bilinci oluşturma kampanyaları', category: 'Faaliyetlerimiz', url: 'activities.html#cevre' },
        { title: 'Meslek Edindirme', summary: 'İşsiz gençlere meslek edindirme ve istihdam desteği', category: 'Faaliyetlerimiz', url: 'activities.html#meslek' },
        // Diğer sayfalar
        { title: 'Hakkımızda', summary: 'Dernek hakkında bilgi, misyon, vizyon', category: 'Diğer', url: 'about.html' },
        { title: 'Yönetim', summary: 'Dernek yönetim kurulu üyeleri', category: 'Diğer', url: 'management.html' },
        { title: 'İletişim', summary: 'İletişim bilgileri ve formu', category: 'Diğer', url: 'contact.html' },
        { title: 'Bağış Yap', summary: 'Derneğimize bağış yapın, IBAN ve kripto adresleri', category: 'Diğer', url: 'index.html#bagis' },
      ];

      const performSearch = (query) => {
        if (!query || query.trim().length < 2) {
          searchResultsDiv.style.display = 'none';
          return;
        }

        const lowerQuery = query.toLowerCase();
        const allContent = [...searchableContent];

        // Duyuruları ekle
        const announcements = loadAnnouncements();
        announcements.forEach(ann => {
          allContent.push({
            title: ann.title || '',
            summary: ann.summary || '',
            category: 'Duyurular',
            url: 'announcements.html'
          });
        });

        // Arama yap
        const results = allContent.filter(item => {
          return item.title.toLowerCase().includes(lowerQuery) ||
                 item.summary.toLowerCase().includes(lowerQuery);
        });

        if (results.length === 0) {
          searchResultsDiv.innerHTML = '<div class="search-no-results">Sonuç bulunamadı</div>';
          searchResultsDiv.style.display = 'block';
          return;
        }

        // Kategorilere göre grupla
        const grouped = {
          'Duyurular': results.filter(r => r.category === 'Duyurular'),
          'Faaliyetlerimiz': results.filter(r => r.category === 'Faaliyetlerimiz'),
          'Diğer': results.filter(r => r.category === 'Diğer')
        };

        let html = '';
        for (const [category, items] of Object.entries(grouped)) {
          if (items.length > 0) {
            html += `<div class="search-category">
              <h4 class="search-category-title">${category}</h4>
              <div class="search-category-items">`;
            items.forEach(item => {
              const icon = category === 'Duyurular' ? '📢' : category === 'Faaliyetlerimiz' ? '🎯' : '📄';
              const hashIndex = item.url.indexOf('#');
              const base = hashIndex >= 0 ? item.url.slice(0, hashIndex) : item.url;
              const hash = hashIndex >= 0 ? item.url.slice(hashIndex) : '';
              const href = `${base}${base.includes('?') ? '&' : '?'}q=${encodeURIComponent(query)}${hash}`;
              html += `<a href="${href}" class="search-result-item">
                <span class="search-result-icon">${icon}</span>
                <div class="search-result-content">
                  <div class="search-result-title">${item.title}</div>
                  <div class="search-result-summary">${item.summary}</div>
                </div>
              </a>`;
            });
            html += `</div></div>`;
          }
        }

        searchResultsDiv.innerHTML = html;
        searchResultsDiv.style.display = 'block';
      };

      let searchTimeout;
      siteSearchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => performSearch(e.target.value), 300);
      });

      siteSearchInput.addEventListener('focus', (e) => {
        if (e.target.value.trim().length >= 2) {
          performSearch(e.target.value);
        }
      });

      // Dışarı tıklayınca kapat
      document.addEventListener('click', (e) => {
        if (!siteSearchInput.contains(e.target) && !searchResultsDiv.contains(e.target)) {
          searchResultsDiv.style.display = 'none';
        }
      });
    }
    
    // Sayfa açılışında ?q=... varsa: otomatik highlight ve ilk eşleşmeye kaydır
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = (urlParams.get('q') || '').trim();
    if (initialQuery.length > 0) {
      const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const SKIP_SELECTOR = 'script, style, noscript, header, nav, footer, .navbar, .search-results, .site-footer, .announcement-controls';

      // Yardımcı: Belirli bir kökte highlight uygula
      const highlightWithin = (root, query) => {
        const regex = new RegExp(escapeRegExp(query), 'gi');
        let highlighted = 0;
        const walk = (node) => {
          if (node.nodeType === 1) {
            const el = node;
            if (el.matches && el.matches(SKIP_SELECTOR)) return;
            const cs = window.getComputedStyle(el);
            if (cs && (cs.visibility === 'hidden' || cs.display === 'none')) return;
            Array.from(el.childNodes).forEach(walk);
          } else if (node.nodeType === 3) {
            const text = node.nodeValue;
            if (!text || !regex.test(text)) return;
            regex.lastIndex = 0;
            const frag = document.createDocumentFragment();
            let lastIndex = 0;
            let m;
            while ((m = regex.exec(text)) !== null) {
              const before = text.slice(lastIndex, m.index);
              if (before) frag.appendChild(document.createTextNode(before));
              const mark = document.createElement('mark');
              mark.className = 'search-highlight';
              mark.textContent = m[0];
              frag.appendChild(mark);
              highlighted++;
              lastIndex = regex.lastIndex;
            }
            const after = text.slice(lastIndex);
            if (after) frag.appendChild(document.createTextNode(after));
            node.parentNode.replaceChild(frag, node);
          }
        };
        walk(root);
        return highlighted;
      };

      // Navigasyon UI
      let navState = { index: 0, marks: [] };
      const collectMarks = () => Array.from(document.querySelectorAll('mark.search-highlight'));
      const focusMark = (i) => {
        if (!navState.marks.length) return;
        navState.index = (i + navState.marks.length) % navState.marks.length;
        navState.marks.forEach(m => m.classList.remove('active'));
        const el = navState.marks[navState.index];
        if (el) {
          el.classList.add('active');
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Eğer işaret duyuru/aktivite kartında ise modalı aç ve modal içinde vurgula
          const annCard = el.closest && el.closest('.announcement-card');
          const actCard = el.closest && el.closest('.activity-card');
          if (annCard) {
            annCard.click();
            setTimeout(() => {
              const modal = document.getElementById('announcementModal');
              if (modal) {
                // Modal içinde de vurgula
                highlightWithin(modal, initialQuery);
                // Listeyi güncelle ve modal içindeki ilk eşleşmeye odaklan
                navState.marks = collectMarks();
                const modalIdx = navState.marks.findIndex(m => modal.contains(m));
                if (modalIdx >= 0) {
                  // sonsuz döngüyü önlemek için doğrudan index ataması ve kaydırma
                  navState.index = modalIdx;
                  navState.marks.forEach(m => m.classList.remove('active'));
                  const modalEl = navState.marks[navState.index];
                  if (modalEl) {
                    modalEl.classList.add('active');
                    modalEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }
              }
              const counter = document.getElementById('search-nav-counter');
              if (counter) counter.textContent = `${navState.index + 1}/${navState.marks.length}`;
            }, 200);
          } else if (actCard) {
            actCard.click();
            setTimeout(() => {
              const modal = document.getElementById('activityModal');
              if (modal) {
                highlightWithin(modal, initialQuery);
                navState.marks = collectMarks();
                const modalIdx = navState.marks.findIndex(m => modal.contains(m));
                if (modalIdx >= 0) {
                  navState.index = modalIdx;
                  navState.marks.forEach(m => m.classList.remove('active'));
                  const modalEl = navState.marks[navState.index];
                  if (modalEl) {
                    modalEl.classList.add('active');
                    modalEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }
              }
              const counter = document.getElementById('search-nav-counter');
              if (counter) counter.textContent = `${navState.index + 1}/${navState.marks.length}`;
            }, 200);
          }
        }
        const counter = document.getElementById('search-nav-counter');
        if (counter) counter.textContent = `${navState.index + 1}/${navState.marks.length}`;
      };
      const ensureNavUI = () => {
        if (document.getElementById('search-nav')) return;
        const nav = document.createElement('div');
        nav.id = 'search-nav';
        nav.className = 'search-nav';
        nav.innerHTML = `
          <button type="button" id="search-prev" aria-label="Önceki">◀</button>
          <span id="search-nav-counter">0/0</span>
          <button type="button" id="search-next" aria-label="Sonraki">▶</button>
        `;
        document.body.appendChild(nav);
        document.getElementById('search-prev').addEventListener('click', () => focusMark(navState.index - 1));
        document.getElementById('search-next').addEventListener('click', () => focusMark(navState.index + 1));
      };

      const afterHighlighted = () => {
        navState.marks = collectMarks();
        if (navState.marks.length) {
          ensureNavUI();
          focusMark(0);
          // Eğer ilk eşleşme duyuru/aktivite kartının içindeyse modalı aç
          const first = navState.marks[0];
          const annCard = first.closest && first.closest('.announcement-card');
          const actCard = first.closest && first.closest('.activity-card');
          if (annCard) {
            annCard.click();
            // Modal içerik yüklendikten sonra modal içinde de highlight uygula
            setTimeout(() => {
              const modal = document.getElementById('announcementModal');
              if (modal) {
                highlightWithin(modal, initialQuery);
                navState.marks = collectMarks();
                focusMark(navState.marks.findIndex(m => modal.contains(m)) || 0);
              }
            }, 200);
          } else if (actCard) {
            actCard.click();
            setTimeout(() => {
              const modal = document.getElementById('activityModal');
              if (modal) {
                highlightWithin(modal, initialQuery);
                navState.marks = collectMarks();
                focusMark(navState.marks.findIndex(m => modal.contains(m)) || 0);
              }
            }, 200);
          }
        }
      };

      const tryHighlight = (attemptsLeft = 12) => {
        let highlighted = 0;
        const containers = document.querySelectorAll('main, .announcement-center, .about-content, .activities, .container, section');
        if (containers.length > 0) {
          containers.forEach(c => highlighted += highlightWithin(c, initialQuery));
        } else {
          highlighted += highlightWithin(document.body, initialQuery);
        }
        if (highlighted > 0) {
          afterHighlighted();
        } else if (attemptsLeft > 0) {
          setTimeout(() => tryHighlight(attemptsLeft - 1), 200);
        }
      };

      setTimeout(() => tryHighlight(), 50);
    }

    // Donate (Bağış) sayfası kart etkileşimi
    (function initDonatePage() {
      const payCard = document.getElementById('payCard');
      if (!payCard) return;
      const nameInput = document.getElementById('cardName');
      const numInput = document.getElementById('cardNumber');
      const mInput = document.getElementById('cardExpMonth');
      const yInput = document.getElementById('cardExpYear');
      const cvvInput = document.getElementById('cardCvv');
      const amountButtons = Array.from(document.querySelectorAll('.amount-card[data-amount]'));
      const customAmountInput = document.getElementById('customAmount');
      const customCard = document.querySelector('.amount-card.custom-card');
      const donateForm = document.getElementById('donateForm');
      let selectedAmount = ''; // Başlangıçta hiçbir miktar seçili olmasın

      const nameDisplay = document.getElementById('cardNameDisplay');
      const numDisplay = document.getElementById('cardNumDisplay');
      const expDisplay = document.getElementById('cardExpDisplay');
      const cvvDisplay = document.getElementById('cardCvvDisplay');

      const formatNum = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
      const clampNum = (v, max) => v.replace(/\D/g, '').slice(0, max);
      const pad2 = (v) => (v || '').replace(/\D/g, '').slice(0, 2).padStart(2, '0');

      const setSelectedAmount = (val, isCustom = false) => {
        selectedAmount = val;
        if (donateForm) donateForm.dataset.amount = val;
        amountButtons.forEach((btn) => {
          btn.classList.toggle('active', !isCustom && btn.dataset.amount === val);
        });
        if (customCard) {
          customCard.classList.toggle('active', isCustom);
        }
      };

      amountButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const amt = btn.dataset.amount || '';
          setSelectedAmount(amt, false);
          if (customAmountInput) customAmountInput.value = amt;
        });
      });

      if (customAmountInput) {
        const normalizeAmount = (v) => (v || '').replace(/[^0-9]/g, '').slice(0, 7);
        customAmountInput.addEventListener('input', () => {
          const clean = normalizeAmount(customAmountInput.value);
          customAmountInput.value = clean;
          setSelectedAmount(clean, true);
        });
        customAmountInput.addEventListener('focus', () => {
          const clean = normalizeAmount(customAmountInput.value);
          setSelectedAmount(clean, true);
        });
          // Custom input blur olduğunda boşsa seçimi kaldır
          customAmountInput.addEventListener('blur', () => {
            const clean = normalizeAmount(customAmountInput.value);
            if (!clean || clean === '0') {
              setSelectedAmount('', false);
              if (customCard) customCard.classList.remove('active');
            }
          });
      }

        // İlk yüklemede hiçbir hazır tutar seçili olmasın; kullanıcı seçsin
        setSelectedAmount('', false);

      const updateFront = () => {
        const nm = (nameInput.value || '').trim();
        nameDisplay.textContent = nm ? nm.toUpperCase() : 'AD SOYAD';
        const numFmt = formatNum(numInput.value || '');
        numDisplay.textContent = numFmt || '#### #### #### ####';
        const mm = pad2(mInput.value || '');
        let yy = clampNum(yInput.value || '', 2);
        yy = yy.length === 2 ? yy : 'YY';
        expDisplay.textContent = (mm !== '00' && yy !== 'YY') ? `${mm}/${yy}` : 'MM/YY';
      };

      const checkFlipToBack = () => {
        const nmOk = (nameInput.value || '').trim().length > 0;
        const numDigits = (numInput.value || '').replace(/\D/g, '').length;
        const mmOk = (mInput.value || '').replace(/\D/g, '').length === 2;
        const yyOk = (yInput.value || '').replace(/\D/g, '').length === 2;
        if (nmOk && numDigits === 16 && mmOk && yyOk) {
          payCard.classList.add('flipped');
        }
      };

      ['input', 'blur'].forEach(evt => {
        nameInput.addEventListener(evt, () => { updateFront(); checkFlipToBack(); });
        numInput.addEventListener(evt, () => {
          const raw = numInput.value || '';
          const digits = raw.replace(/\D/g, '').slice(0, 16);
          numInput.value = formatNum(digits);
          updateFront();
          checkFlipToBack();
        });
        mInput.addEventListener(evt, () => {
          let mm = mInput.value.replace(/\D/g, '').slice(0, 2);
          if (mm.length === 2) {
            const n = Number(mm);
            if (n < 1) mm = '01';
            if (n > 12) mm = '12';
          }
          mInput.value = mm;
          updateFront();
          checkFlipToBack();
        });
        yInput.addEventListener(evt, () => {
          let yy = yInput.value.replace(/\D/g, '').slice(0, 2);
          yInput.value = yy;
          updateFront();
          checkFlipToBack();
        });
      });

      cvvInput.addEventListener('focus', () => {
        payCard.classList.add('flipped');
      });
      cvvInput.addEventListener('input', () => {
        let cv = cvvInput.value.replace(/\D/g, '').slice(0, 4);
        cvvInput.value = cv;
        cvvDisplay.textContent = cv || 'CVV';
      });

      // Ön yüze ait alanlara gelince kartı ön yüze döndür
      const flipFront = () => payCard.classList.remove('flipped');
      nameInput.addEventListener('focus', flipFront);
      numInput.addEventListener('focus', flipFront);
      mInput.addEventListener('focus', flipFront);
      yInput.addEventListener('focus', flipFront);

      // Ön yüz alanlarında giriş yapılırken de ön yüz açık kalsın
      nameInput.addEventListener('input', flipFront);
      numInput.addEventListener('input', flipFront);
      mInput.addEventListener('input', flipFront);
      yInput.addEventListener('input', flipFront);

      // İlk render
      updateFront();

      // ==================== BAĞIŞ MODALİ ====================
      const donationModal = document.getElementById('donation-modal');
      const donationModalMessage = document.getElementById('donation-modal-message');
      const donationModalClose = document.getElementById('donation-modal-close');
      const donationInvoiceBtn = document.getElementById('donation-invoice-btn');
      const donationShareButtons = document.querySelectorAll('.donation-share button[data-share]');
      let lastDonationText = '0 TL';

      const formatTLText = (value) => `${Math.floor(value).toLocaleString('tr-TR')} TL`;

      const setModalVisibility = (visible) => {
        if (!donationModal) return;
        donationModal.classList.toggle('open', visible);
        donationModal.setAttribute('aria-hidden', visible ? 'false' : 'true');
      };

      const openDonationModal = (amountText) => {
        lastDonationText = amountText;
        if (donationModalMessage) {
          donationModalMessage.textContent = `${amountText} tutarındaki değerli bağışınız başarıyla alınmıştır.`;
        }
        setModalVisibility(true);
      };

      const closeDonationModal = () => setModalVisibility(false);

      const copyToClipboard = async (text) => {
        try {
          if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
          }
        } catch (err) {
          return false;
        }
        return false;
      };

      const buildShareMessage = (amountText) => {
        return `İyiliğe küçük bir katkı bıraktım. ${amountText} bağış yaparak bu yolculuğun parçası oldum.`;
      };

      if (donationModalClose) {
        donationModalClose.addEventListener('click', closeDonationModal);
      }

      if (donationModal) {
        donationModal.addEventListener('click', (e) => {
          if (e.target === donationModal) closeDonationModal();
        });
      }

      if (donationInvoiceBtn) {
        donationInvoiceBtn.addEventListener('click', () => {
          const now = new Date();
          const content = [
            'Ufuk Derneği Bağış Makbuzu',
            '----------------------------',
            `Tutar: ${lastDonationText}`,
            `Tarih: ${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR')}`,
            'Bağışınız için teşekkür ederiz.'
          ].join('\n');

          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `bagis-makbuzu-${now.toISOString().slice(0, 10)}.txt`;
          link.click();
          URL.revokeObjectURL(url);
        });
      }

      if (donationShareButtons && donationShareButtons.length) {
        donationShareButtons.forEach((btn) => {
          btn.addEventListener('click', async () => {
            const platform = btn.getAttribute('data-share');
            const shareText = buildShareMessage(lastDonationText);
            const encoded = encodeURIComponent(shareText);

            if (platform === 'twitter') {
              window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank');
              return;
            }

            if (platform === 'whatsapp') {
              window.open(`https://wa.me/?text=${encoded}`, '_blank');
              return;
            }

            if (platform === 'instagram') {
              const copied = await copyToClipboard(shareText);
              window.open('https://www.instagram.com', '_blank');
              if (copied) {
                alert('Mesaj panonuza kopyalandı. Instagram paylaşımınızda yapıştırabilirsiniz.');
              }
              return;
            }
          });
        });
      }

      // ==================== DEVAM ET BUTONU İŞLEVSELLİĞİ ====================
      const continueBtn = document.getElementById('donateContinue');
      if (continueBtn) {
        continueBtn.addEventListener('click', () => {
          // Form validasyonu
          const name = (nameInput.value || '').trim();
          const cardNum = (numInput.value || '').replace(/\D/g, '');
          const expMonth = (mInput.value || '').replace(/\D/g, '');
          const expYear = (yInput.value || '').replace(/\D/g, '');
          const cvv = (cvvInput.value || '').replace(/\D/g, '');
          const amount = selectedAmount;
          const isCustomAmount = customCard && customCard.classList.contains('active');

          // BAĞIŞ MİKTARI KONTROLÜ (ÖNCELİKLE)
          if (!amount || amount === '' || amount === '0' || parseFloat(amount) <= 0) {
            if (isCustomAmount) {
              alert('⚠️ Lütfen "İstediğin Miktar" alanına geçerli bir tutar giriniz.\n\nÖrnek: 500');
              if (customAmountInput) customAmountInput.focus();
            } else {
              alert('⚠️ Lütfen bir bağış miktarı seçiniz veya kendi tutarınızı giriniz.');
            }
            return;
          }

          // KART AD-SOYAD KONTROLÜ
          if (!name || name.length < 3) {
            alert('⚠️ Lütfen kart üzerindeki ad ve soyad bilgisini tam olarak giriniz.\n\nÖrnek: Ahmet Yılmaz');
            nameInput.focus();
            return;
          }
          
          // SOYAD KONTROLÜ - En az bir boşluk olmalı (ad soyad ayrımı için)
          if (!name.includes(' ') || name.trim().split(/\s+/).length < 2) {
            alert('⚠️ Lütfen hem adınızı hem de soyadınızı giriniz.\n\nÖrnek: Ahmet Yılmaz');
            nameInput.focus();
            return;
          }
          
          // Her iki kelime de en az 2 karakter olmalı
          const nameParts = name.trim().split(/\s+/);
          if (nameParts[0].length < 2 || nameParts[1].length < 2) {
            alert('⚠️ Ad ve soyad en az 2 karakter olmalıdır.\n\nÖrnek: Ahmet Yılmaz');
            nameInput.focus();
            return;
          }
          
          // KART NUMARASI KONTROLÜ
          if (!cardNum || cardNum.length === 0) {
            alert('⚠️ Lütfen kart numaranızı giriniz.\n\n16 haneli kart numaranızı eksiksiz yazınız.');
            numInput.focus();
            return;
          }
          
          if (cardNum.length < 16) {
            alert(`⚠️ Kart numarası eksik!\n\nGirilen: ${cardNum.length} hane\nGerekli: 16 hane\n\nLütfen kart numaranızı eksiksiz giriniz.`);
            numInput.focus();
            return;
          }
          
          if (cardNum.length > 16) {
            alert('⚠️ Kart numarası 16 haneden fazla olamaz.\n\nLütfen kontrol ediniz.');
            numInput.focus();
            return;
          }
          
          // SON KULLANMA TARİHİ - AY KONTROLÜ
          if (!expMonth || expMonth.length === 0) {
            alert('⚠️ Lütfen kartın son kullanma ayını giriniz.\n\nÖrnek: 12 (Aralık ayı için)');
            mInput.focus();
            return;
          }
          
          if (expMonth.length < 2) {
            alert('⚠️ Ay bilgisi eksik!\n\nLütfen 2 haneli ay bilgisi giriniz.\nÖrnek: 01, 06, 12');
            mInput.focus();
            return;
          }
          
          const monthNum = parseInt(expMonth);
          if (monthNum < 1 || monthNum > 12) {
            alert('⚠️ Geçersiz ay!\n\nAy bilgisi 01 ile 12 arasında olmalıdır.\nÖrnek: 01 (Ocak), 12 (Aralık)');
            mInput.focus();
            return;
          }
          
          // SON KULLANMA TARİHİ - YIL KONTROLÜ
          if (!expYear || expYear.length === 0) {
            alert('⚠️ Lütfen kartın son kullanma yılını giriniz.\n\nÖrnek: 27 (2027 yılı için)');
            yInput.focus();
            return;
          }
          
          if (expYear.length < 2) {
            alert('⚠️ Yıl bilgisi eksik!\n\nLütfen 2 haneli yıl bilgisi giriniz.\nÖrnek: 25, 26, 27');
            yInput.focus();
            return;
          }
          
          // CVV KONTROLÜ
          if (!cvv || cvv.length === 0) {
            alert('⚠️ Lütfen kartınızın arkasındaki CVV kodunu giriniz.\n\nCVV kodu 3 veya 4 haneli güvenlik kodudur.');
            cvvInput.focus();
            return;
          }
          
          if (cvv.length < 3) {
            alert(`⚠️ CVV kodu eksik!\n\nGirilen: ${cvv.length} hane\nGerekli: En az 3 hane\n\nLütfen kartınızın arkasındaki güvenlik kodunu tam olarak giriniz.`);
            cvvInput.focus();
            return;
          }

          // Bağışı işle
          const donationAmount = parseFloat(amount);
          
          // LocalStorage'a bağışı ekle
          const DONATION_KEY = 'totalDonations';
          const currentTotal = parseFloat(localStorage.getItem(DONATION_KEY) || '0');
          const newTotal = currentTotal + donationAmount;
          localStorage.setItem(DONATION_KEY, newTotal.toString());
          
          // Kullanıcının bağış detayını kaydet
          const currentUser = JSON.parse(sessionStorage.getItem('user') || 'null');
          if (currentUser && currentUser.email) {
            const donations = JSON.parse(localStorage.getItem('donations') || '[]');
            donations.push({
              email: currentUser.email,
              name: `${currentUser.firstName} ${currentUser.lastName}`,
              amount: donationAmount,
              date: new Date().toISOString(),
              timestamp: Date.now()
            });
            localStorage.setItem('donations', JSON.stringify(donations));
          }
          
          // Başarı modalini göster
          const formattedAmount = formatTLText(donationAmount);
          openDonationModal(formattedAmount);
          
          // Formu temizle
          nameInput.value = '';
          numInput.value = '';
          mInput.value = '';
          yInput.value = '';
          cvvInput.value = '';
          if (customAmountInput) customAmountInput.value = '';
          
          // Kartı sıfırla
          updateFront();
          cvvDisplay.textContent = 'CVV';
          payCard.classList.remove('flipped');
          
          // İlk tutarı seç
          setSelectedAmount(amountButtons[0]?.dataset.amount || '50', false);
        });
      }
      // ==================== DEVAM ET BUTONU İŞLEVSELLİĞİ BİTİŞ ====================
    })();

    (function initDonationManagementPage() {
      if (currentPage !== 'donation-management.html' || !isAdmin(su)) return;

      const svg = document.getElementById('donation-chart');
      const yAxisGroup = document.getElementById('y-axis-group');
      const lineGroup = document.getElementById('line-group');
      const xAxisGroup = document.getElementById('x-axis-group');
      const pointsGroup = document.getElementById('points-group');
      const resetBtn = document.getElementById('donation-reset-btn');

      if (!svg || !yAxisGroup || !lineGroup || !xAxisGroup || !pointsGroup) return;

      const DEFAULT_FIXED_VALUES = [0, 120000, 250000, 400000, 580000, 760000];
      const FIXED_VALUES_KEY = 'donationFixedValues';

      const getFixedValues = () => {
        const stored = localStorage.getItem(FIXED_VALUES_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length === 6) {
              return parsed.map((v) => Number(v) || 0);
            }
          } catch (err) {
            // ignore parse errors and fallback
          }
        }
        return DEFAULT_FIXED_VALUES;
      };

      // Grafik boyutları ve padding
      const width = 800;
      const height = 400;
      const padding = { top: 40, right: 60, bottom: 60, left: 80 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      // Bağış verileri
      const goal = DONATION_GOAL; // 1.000.000
      const currentDonation = getDonationAmount();
      
      // Grafiği çizmek için fonksiyon
      const drawChart = () => {
        // Grupları temizle
        yAxisGroup.innerHTML = '';
        lineGroup.innerHTML = '';
        xAxisGroup.innerHTML = '';
        pointsGroup.innerHTML = '';

        // Mevcut bağış tutarını al
        const current = getDonationAmount();

        // 7 aylık veri - İlk 6 ay sabit, sadece Ocak ayı değişken
        const days = ['Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık', 'Ocak'];
        const fixedValues = getFixedValues(); // İlk 6 ayın değerleri (reset sonrası 0 olabilir)
        
        const dataPoints = days.map((day, index) => ({
          day: day,
          value: index < 6 ? fixedValues[index] : current // Ocak ayı (index=6) mevcut bağış tutarı
        }));

        // Y ekseni scale
        const yScale = (value) => {
          const ratio = value / goal;
          return padding.top + chartHeight - (ratio * chartHeight);
        };

        // X ekseni scale
        const xScale = (index) => {
          return padding.left + (index * (chartWidth / (days.length - 1)));
        };

        // Y ekseni ızgarası ve etiketleri
        const yTicks = [0, 0.25, 0.5, 0.75, 1];
        yTicks.forEach(tick => {
          const value = goal * tick;
          const y = yScale(value);
          
          // Yatay ızgara çizgisi
          const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          gridLine.setAttribute('x1', padding.left);
          gridLine.setAttribute('x2', width - padding.right);
          gridLine.setAttribute('y1', y);
          gridLine.setAttribute('y2', y);
          gridLine.setAttribute('stroke', '#e5e7eb');
          gridLine.setAttribute('stroke-width', '1');
          gridLine.setAttribute('stroke-dasharray', tick === 0 || tick === 1 ? '0' : '4,4');
          yAxisGroup.appendChild(gridLine);

          // Y ekseni değer etiketi
          const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          label.setAttribute('x', padding.left - 10);
          label.setAttribute('y', y + 5);
          label.setAttribute('text-anchor', 'end');
          label.setAttribute('fill', '#475569');
          label.setAttribute('font-size', '14');
          label.setAttribute('font-weight', '500');
          
          // Değeri formatla (örn: 1.000.000)
          const formattedValue = Math.floor(value).toLocaleString('tr-TR');
          label.textContent = formattedValue + '₺';
          yAxisGroup.appendChild(label);
        });

        // Çizgi grafiği çiz
        const linePoints = dataPoints.map((point, index) => {
          const x = xScale(index);
          const y = yScale(point.value);
          return `${x},${y}`;
        }).join(' ');

        const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline.setAttribute('points', linePoints);
        polyline.setAttribute('fill', 'none');
        polyline.setAttribute('stroke', '#3b82f6');
        polyline.setAttribute('stroke-width', '3');
        polyline.setAttribute('stroke-linejoin', 'round');
        polyline.setAttribute('stroke-linecap', 'round');
        lineGroup.appendChild(polyline);

        // X ekseni gün etiketleri
        dataPoints.forEach((point, index) => {
          const x = xScale(index);
          const y = height - padding.bottom + 30;
          
          const dayLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          dayLabel.setAttribute('x', x);
          dayLabel.setAttribute('y', y);
          dayLabel.setAttribute('text-anchor', 'middle');
          dayLabel.setAttribute('fill', '#475569');
          dayLabel.setAttribute('font-size', '14');
          dayLabel.setAttribute('font-weight', '500');
          dayLabel.textContent = point.day;
          xAxisGroup.appendChild(dayLabel);
        });

        // Veri noktaları ve değer etiketleri
        dataPoints.forEach((point, index) => {
          const x = xScale(index);
          const y = yScale(point.value);

          // Nokta
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', x);
          circle.setAttribute('cy', y);
          circle.setAttribute('r', '5');
          circle.setAttribute('fill', '#3b82f6');
          circle.setAttribute('stroke', '#ffffff');
          circle.setAttribute('stroke-width', '2');
          pointsGroup.appendChild(circle);

          // Değer etiketi (noktanın üzerinde)
          const valueLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          valueLabel.setAttribute('x', x);
          valueLabel.setAttribute('y', y - 15);
          valueLabel.setAttribute('text-anchor', 'middle');
          valueLabel.setAttribute('fill', '#0f172a');
          valueLabel.setAttribute('font-size', '13');
          valueLabel.setAttribute('font-weight', '600');
          
          const formattedValue = Math.floor(point.value).toLocaleString('tr-TR');
          valueLabel.textContent = formattedValue + '₺';
          pointsGroup.appendChild(valueLabel);
        });
      };

      // Grafiği ilk çiz
      drawChart();

      // Sıfırla butonu
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (confirm('Tüm bağış verilerini sıfırlamak istediğinize emin misiniz?')) {
            localStorage.setItem('totalDonations', '0');
            localStorage.setItem(FIXED_VALUES_KEY, JSON.stringify(new Array(6).fill(0)));
            alert('Bağış verileri sıfırlandı.');
            drawChart();
          }
        });
      }
    })();
  });
})();
