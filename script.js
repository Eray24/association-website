// Dinamik sayfa yükleme
(function() {
  // Sayfa dosyası varsa döndür, yoksa localStorage'dan kontrol et
  window.loadDynamicPageContent = async function(pageId) {
    const container = document.getElementById('page-content');
    if (!container) return;

    // localStorage'da kayıtlı sayfa içeriğini kontrol et
    const pages = JSON.parse(localStorage.getItem('customPages') || '{}');
    if (pages[pageId]) {
      container.innerHTML = pages[pageId];
    }
  };

  // Sayfa yüklendiğinde çalıştır
  document.addEventListener('DOMContentLoaded', () => {
    // URL'den sayfa ID'sini al (refresh yapılsa da çalışacak)
    const urlParams = new URLSearchParams(window.location.search);
    const pageIdFromUrl = urlParams.get('id');
    
    if (pageIdFromUrl) {
      // URL'de ID varsa, customPages localStorage'dan içeriği al
      const customPages = JSON.parse(localStorage.getItem('customPages') || '{}');
      const dynamicPageContent = customPages[pageIdFromUrl];
      const menuItems = JSON.parse(localStorage.getItem('navigationMenu') || '[]');
      const menuItem = menuItems.find(item => item.url === pageIdFromUrl);
      const dynamicPageLabel = menuItem?.label || pageIdFromUrl;
      
      if (dynamicPageContent) {
        const container = document.getElementById('page-content');
        if (container) {
          container.innerHTML = dynamicPageContent;
        }
        const heroTitle = document.getElementById('dynamic-page-title');
        if (heroTitle) {
          heroTitle.textContent = dynamicPageLabel || pageIdFromUrl;
        }
        return;
      }
    }
    
    // Eski yöntem: localStorage'daki dinamik sayfa (backward compat)
    const dynamicPageId = localStorage.getItem('_dynamicPageId');
    const dynamicPageLabel = localStorage.getItem('_dynamicPageLabel');
    const dynamicPageContent = localStorage.getItem('_dynamicPageContent');
    
    if (dynamicPageId && dynamicPageContent) {
      const container = document.getElementById('page-content');
      if (container) {
        container.innerHTML = dynamicPageContent;
      }
      // Hero başlığını güncelle
      const heroTitle = document.getElementById('dynamic-page-title');
      if (heroTitle) {
        heroTitle.textContent = dynamicPageLabel || 'Sayfa';
      }
      // Temizle
      localStorage.removeItem('_dynamicPageId');
      localStorage.removeItem('_dynamicPageLabel');
      localStorage.removeItem('_dynamicPageContent');
      return;
    }
    
    // Normal sayfa yüklemesi
    const currentFile = window.location.pathname.split('/').pop() || '';
    if (currentFile && currentFile.endsWith('.html')) {
      const pageId = currentFile.replace('.html', '');
      window.loadDynamicPageContent(pageId);
    }
  });
})();

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

    // Ana sayfada Bağış Yap butonunun yanına Sosyal Medya butonu ekle (tüm kullanıcılar için)
    if (currentPage === '' || currentPage === 'index.html') {
      const donateBtn = document.querySelector('.hero .buttons a[href="donate.html"]');
      const existingSocialBtn = document.querySelector('.hero .buttons a[href="#social"]');
      
      if (donateBtn && !existingSocialBtn) {
        const socialBtn = document.createElement('a');
        socialBtn.href = '#social';
        socialBtn.className = donateBtn.className || 'primary';
        socialBtn.textContent = 'Sosyal Medya';
        socialBtn.style.marginLeft = '8px';
        donateBtn.insertAdjacentElement('afterend', socialBtn);
      }
    }

    // Ana sayfada Bağış Yap butonunun yanına yönetim/üye butonlarını ekle (hem admin hem üye için)
    if ((currentPage === '' || currentPage === 'index.html') && su && (su.role === 'member' || su.role === 'admin')) {
      const donateBtn = document.querySelector('.hero .buttons a[href="donate.html"]');
      const existingManageBtn = document.querySelector('.hero .buttons a[href="donation-management.html"]');
      const existingMyDonationsBtn = document.querySelector('.hero .buttons a[href="my-donations.html"]');
      
      if (donateBtn) {
        // Sosyal Medya butonunu bul (artık zaten var)
        const socialBtn = document.querySelector('.hero .buttons a[href="#social"]');
        const targetAfterSocial = socialBtn || donateBtn;

        // Üye veya Admin için Bağışlarım butonu (Sosyal Medya'dan sonra)
        if (!existingMyDonationsBtn) {
          const myDonationsBtn = document.createElement('a');
          myDonationsBtn.href = 'my-donations.html';
          myDonationsBtn.className = donateBtn.className || 'primary';
          myDonationsBtn.textContent = 'Bağışlarım';
          myDonationsBtn.style.marginLeft = '8px';
          targetAfterSocial.insertAdjacentElement('afterend', myDonationsBtn);
        }
        
        // Sadece Admin için Bağış Yönetim butonu (Bağışlarım'dan sonra)
        if (isAdmin(su) && !existingManageBtn) {
          const myDonationsBtn = document.querySelector('.hero .buttons a[href="my-donations.html"]');
          const targetBtn = myDonationsBtn || targetAfterSocial;
          const manageBtn = document.createElement('a');
          manageBtn.href = 'donation-management.html';
          manageBtn.className = donateBtn.className || 'primary';
          manageBtn.textContent = 'Bağış Yönetim';
          manageBtn.style.marginLeft = '8px';
          targetBtn.insertAdjacentElement('afterend', manageBtn);
        }
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
      // Resim compression fonksiyonu
      const compressImage = (file, maxWidth = 600, maxHeight = 400, quality = 0.8) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              
              // Aspect ratio'yu koru
              if (width > height) {
                if (width > maxWidth) {
                  height = Math.round(height * (maxWidth / width));
                  width = maxWidth;
                }
              } else {
                if (height > maxHeight) {
                  width = Math.round(width * (maxHeight / height));
                  height = maxHeight;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              
              // Base64 data URL'e çevir
              canvas.toBlob((blob) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              }, 'image/jpeg', quality);
            };
            img.onerror = reject;
            img.src = e.target.result;
          };
          
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      const annListEl = document.getElementById("ann-list");
      const annForm = document.getElementById("annForm");
      const annNewBtn = document.getElementById("annNewBtn");
      const annEditIndex = document.getElementById("annEditIndex");
      const annTitle = document.getElementById("annTitle");
      const annDate = document.getElementById("annDate");
      const annBody = document.getElementById("annBody");
      const annTags = document.getElementById("annTags");
      const annCancelBtn = document.getElementById("annCancelBtn");
      const annImageInput = document.getElementById("annImage");

      let announcements = loadAnnouncements();
      let compressedImageData = null;

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
              annTags.value = (ann.tags || []).join(", ");
              compressedImageData = null; // Reset compressed image
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
        if (annImageInput) annImageInput.value = "";
        compressedImageData = null;
        if (annForm) annForm.style.display = "none";
      };

      if (annNewBtn && isAdmin(su)) {
        annNewBtn.addEventListener("click", () => {
          resetForm();
          if (annForm) annForm.style.display = "block";
        });
      }

      // Resim input change event
      if (annImageInput) {
        annImageInput.addEventListener('change', async (e) => {
          const file = e.target.files?.[0];
          if (!file) {
            compressedImageData = null;
            return;
          }

          try {
            compressedImageData = await compressImage(file, 600, 400, 0.8);
            alert(`✓ Resim optimize edildi (Boyut: ${(new Blob([compressedImageData]).size / 1024).toFixed(2)} KB)`);
          } catch (err) {
            alert('Resim işlenirken hata oluştu: ' + err.message);
            compressedImageData = null;
          }
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
          const image = compressedImageData || "";
          const tags = (annTags?.value || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
          if (!title || !date || !summary) {
            alert("Lütfen başlık, tarih ve açıklama alanlarını doldurun.");
            return;
          }
          if (!image) {
            alert("Lütfen bir görsel seçin.");
            return;
          }

          const { day, month } = getDayMonth({ date });
          
          // Eğer resim değiştirilmemişse eski resmi koru
          const idx = annEditIndex.value;
          const finalImage = compressedImageData || (idx !== "" && announcements[Number(idx)] ? announcements[Number(idx)].image : "");
          
          const newAnn = {
            title,
            summary,
            date,
            image: finalImage,
            tags,
            day,
            month,
          };

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
      let lastDonationName = 'Bağışçı';

      const formatTLText = (value) => `${Math.floor(value).toLocaleString('tr-TR')} TL`;

      const setModalVisibility = (visible) => {
        if (!donationModal) return;
        donationModal.classList.toggle('open', visible);
        donationModal.setAttribute('aria-hidden', visible ? 'false' : 'true');
      };

      const openDonationModal = (amountText, donorName = 'Bağışçı') => {
        lastDonationText = amountText;
        lastDonationName = donorName;
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
          const dateStr = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
          const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
          const referenceNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
          
          // PDF içeriğini oluştur
          const pdfContent = `
          <!DOCTYPE html>
          <html lang="tr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bağış Makbuzu</title>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 40px;
                background: white;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
              }
              .header {
                text-align: center;
                margin-bottom: 40px;
              }
              h1 {
                margin: 0 0 10px;
                color: #1b5e20;
                font-size: 32px;
              }
              .subtitle {
                margin: 0;
                color: #666;
                font-size: 16px;
              }
              .amount-box {
                background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
                border-radius: 12px;
                padding: 30px;
                margin-bottom: 30px;
                text-align: center;
              }
              .amount-label {
                margin: 0 0 10px;
                color: #666;
                font-size: 14px;
              }
              .amount-value {
                margin: 0;
                color: #1b5e20;
                font-size: 48px;
                font-weight: bold;
              }
              .details-box {
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 30px;
              }
              .details-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
              }
              .detail-item {
                margin: 0;
              }
              .detail-label {
                margin: 0 0 5px;
                color: #999;
                font-size: 12px;
                text-transform: uppercase;
                font-weight: bold;
              }
              .detail-value {
                margin: 0;
                color: #333;
                font-size: 16px;
                font-weight: 600;
              }
              .status {
                color: #2e7d32;
              }
              .message-box {
                background: #f9f9f9;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 30px;
                text-align: center;
              }
              .message-text {
                margin: 0 0 15px;
                color: #666;
                font-size: 14px;
                line-height: 1.6;
              }
              .message-thanks {
                margin: 0;
                color: #2e7d32;
                font-size: 12px;
                font-weight: 600;
              }
              .footer {
                border-top: 2px solid #e0e0e0;
                padding-top: 20px;
                text-align: center;
              }
              .footer-text {
                margin: 0;
                color: #999;
                font-size: 12px;
              }
              .footer-small {
                margin: 15px 0 0;
                color: #999;
                font-size: 11px;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💝 Bağışınız için Teşekkür Ederiz</h1>
              </div>
              
              <div class="amount-box">
                <p class="amount-label">Bağış Tutarı</p>
                <p class="amount-value">${lastDonationText}</p>
              </div>

              <div class="details-box">
                <div class="details-grid">
                  <div class="detail-item">
                    <p class="detail-label">Bağışçı Adı</p>
                    <p class="detail-value">${lastDonationName}</p>
                  </div>
                  <div class="detail-item">
                    <p class="detail-label">Tarih</p>
                    <p class="detail-value">${dateStr}</p>
                  </div>
                  <div class="detail-item">
                    <p class="detail-label">Saat</p>
                    <p class="detail-value">${timeStr}</p>
                  </div>
                  <div class="detail-item">
                    <p class="detail-label">Durum</p>
                    <p class="detail-value status">✓ Başarılı</p>
                  </div>
                  <div class="detail-item">
                    <p class="detail-label">İşlem No</p>
                    <p class="detail-value">#${referenceNum}</p>
                  </div>
                </div>
              </div>

              <div class="message-box">
              </div>

              <div class="footer">
                <p class="footer-text">
                  📧 info@ufukdernegi.org | 📞 0 (312) 310 10 10<br/>
                  📍 Ankara, Türkiye
                </p>
                <p class="footer-small">
                  Ufuk Derneği © 2025. Tüm hakları saklıdır.
                </p>
              </div>
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => window.close(), 500);
              };
            </script>
          </body>
          </html>
          `;
          
          // Yeni pencere aç ve PDF olarak yazdır
          const printWindow = window.open('', '', 'width=800,height=600');
          printWindow.document.write(pdfContent);
          printWindow.document.close();
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
          openDonationModal(formattedAmount, name);
          
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

    // Faaliyetler sayfası: admin CRUD + modal detay
    (function initActivitiesPage() {
      if (currentPage !== 'activities.html') return;

      // Resim compression fonksiyonu
      const compressImage = (file, maxWidth = 600, maxHeight = 400, quality = 0.8) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              
              // Aspect ratio'yu koru
              if (width > height) {
                if (width > maxWidth) {
                  height = Math.round(height * (maxWidth / width));
                  width = maxWidth;
                }
              } else {
                if (height > maxHeight) {
                  width = Math.round(width * (maxHeight / height));
                  height = maxHeight;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              
              // Base64 data URL'e çevir
              canvas.toBlob((blob) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              }, 'image/jpeg', quality);
            };
            img.onerror = reject;
            img.src = e.target.result;
          };
          
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      const grid = document.getElementById('activities-grid');
      const adminWrapper = document.getElementById('activities-admin');
      const adminList = document.getElementById('activities-admin-list');
      const modal = document.getElementById('activityModal');
      const modalTitle = document.getElementById('modalTitle');
      const modalBody = document.getElementById('modalBody');
      const modalClose = document.querySelector('.modal-close');

      const form = document.getElementById('activityForm');
      const idInput = document.getElementById('activityId');
      const titleInput = document.getElementById('activityTitle');
      const categoryInput = document.getElementById('activityCategory');
      const budgetInput = document.getElementById('activityBudget');
      const imageInput = document.getElementById('activityImage');
      const summaryInput = document.getElementById('activitySummary');
      const descInput = document.getElementById('activityDescription');
      const addBtn = document.getElementById('activityAddBtn');
      const saveBtn = document.getElementById('activitySaveBtn');
      const cancelBtn = document.getElementById('activityCancelBtn');

      let compressedImageData = null;

      const defaultActivities = [
        {
          id: 'egitim',
          title: 'Eğitim Desteği',
          category: '📚 Eğitim',
          budget: '₺125,000',
          image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
          summary: 'Kırsal bölgelerdeki kütüphaneleri yeniliyor, başarılı öğrencilere burs ve teknoloji desteği sağlıyoruz.',
          description: '<p><strong>Proje Amacı:</strong> Maddi imkanı kısıtlı öğrencilerin eğitim hayatlarını sürdürebilmelerini sağlamak.</p><ul><li>✅ 50 öğrenciye yıllık burs desteği</li><li>✅ 200 öğrenciye kırtasiye ve kitap yardımı</li><li>✅ Ücretsiz dersane ve kurs imkanları</li><li>✅ Bilgisayar ve tablet desteği</li></ul><p><strong>Etki:</strong> 250+ öğrenciye ulaşıldı.</p>'
        },
        {
          id: 'saglik',
          title: 'Sağlık Yardımı',
          category: '🏥 Sağlık',
          budget: '₺85,000',
          image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=600&q=80',
          summary: 'Sosyal güvencesi olmayan ailelerin tedavi, ilaç ve rehabilitasyon süreçlerinde yanındayız.',
          description: '<p><strong>Proje Amacı:</strong> İhtiyaç sahibi ailelerin sağlık harcamalarına destek olmak.</p><ul><li>✅ Kronik hastalara ilaç yardımı</li><li>✅ Ameliyat ve tedavi giderlerinde destek</li><li>✅ Ücretsiz sağlık taramaları</li><li>✅ Evde bakım hizmeti</li></ul><p><strong>Etki:</strong> 120 aileye düzenli sağlık desteği sağlandı.</p>'
        },
        {
          id: 'gida',
          title: 'Gıda Yardımı',
          category: '🍽️ Yardım',
          budget: '₺95,000',
          image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80',
          summary: 'Düzenli gıda kolisi ve sıcak yemek dağıtımıyla ihtiyaç sahiplerinin sofralarına destek oluyoruz.',
          description: '<p><strong>Proje Amacı:</strong> Gıda güvencesi olmayan ailelere temel gıda desteği sağlamak.</p><ul><li>✅ Aylık düzenli gıda kolisi dağıtımı</li><li>✅ Ramazan ayında iftar ve kumanya yardımı</li><li>✅ Sokak hayvanları için mama bağışı</li><li>✅ Günlük sıcak yemek servisi</li></ul><p><strong>Etki:</strong> 300+ aileye düzenli gıda yardımı ulaştırıldı.</p>'
        },
        {
          id: 'kultur',
          title: 'Kültür ve Sanat',
          category: '🎭 Sanat',
          budget: '₺45,000',
          image: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=600&q=80',
          summary: 'Ücretsiz tiyatro, atölye ve kurslarla sanata erişimi kolaylaştırıyoruz.',
          description: '<p><strong>Proje Amacı:</strong> Toplumsal kültür birikimini zenginleştirmek ve sanata erişimi kolaylaştırmak.</p><ul><li>✅ Ücretsiz tiyatro ve sinema gösterimleri</li><li>✅ Çocuklara yönelik sanat atölyeleri</li><li>✅ Müzik ve dans kursları</li><li>✅ Kitap okuma kulüpleri</li></ul><p><strong>Etki:</strong> 15 etkinlik, 500+ katılımcı.</p>'
        },
        {
          id: 'cevre',
          title: 'Çevre Projeleri',
          category: '🌱 Doğa',
          budget: '₺35,000',
          image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb7d5fa5?auto=format&fit=crop&w=600&q=80',
          summary: 'Ağaçlandırma ve geri dönüşüm eğitimleriyle sürdürülebilir bir gelecek için çalışıyoruz.',
          description: '<p><strong>Proje Amacı:</strong> Çevre bilincini artırmak ve doğayı korumak.</p><ul><li>✅ Ağaçlandırma kampanyaları</li><li>✅ Geri dönüşüm eğitimleri</li><li>✅ Atık yönetimi projeleri</li><li>✅ Doğa temizliği etkinlikleri</li></ul><p><strong>Etki:</strong> 5.000 fidan toprakla buluştu.</p>'
        },
        {
          id: 'meslek',
          title: 'Meslek Edindirme',
          category: '👷 Kariyer',
          budget: '₺75,000',
          image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a783?auto=format&fit=crop&w=600&q=80',
          summary: 'Kodlama, el sanatları ve tekstilde sertifikalı kurslar ile istihdam köprüleri kuruyoruz.',
          description: '<p><strong>Proje Amacı:</strong> İşsiz bireylere mesleki beceri kazandırmak.</p><ul><li>✅ Kodlama, el sanatları ve tekstil kursları</li><li>✅ Sertifikalı eğitim programları</li><li>✅ İş bulma ve staj imkanı</li><li>✅ Kariyer danışmanlığı</li></ul><p><strong>Etki:</strong> 200 mezun, %40 istihdam oranı.</p>'
        }
      ];

      const stripTags = (html = '') => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
      };

      const loadActivities = () => {
        try {
          const stored = JSON.parse(localStorage.getItem('activitiesData') || 'null');
          if (Array.isArray(stored) && stored.length) return stored;
        } catch (err) {
          // ignore parse error
        }
        return defaultActivities;
      };

      let activities = loadActivities();

      const saveActivities = () => {
        localStorage.setItem('activitiesData', JSON.stringify(activities));
      };

      const renderGrid = () => {
        if (!grid) return;
        grid.innerHTML = '';
        activities.forEach((act) => {
          const card = document.createElement('article');
          card.className = 'blog-card';
          card.dataset.activityId = act.id;
          card.innerHTML = `
            <div class="blog-image">
              <img src="${act.image}" alt="${act.title}">
              <span class="blog-category">${act.category}</span>
            </div>
            <div class="blog-details">
              <h3>${act.title}</h3>
              <p class="blog-summary">${act.summary}</p>
              <div class="blog-footer">
                <span class="budget-badge">🎯 Fon Hedefi: ${act.budget}</span>
                <div class="activity-card-actions" style="display:flex; gap:8px; align-items:center;"></div>
              </div>
              <button class="read-more" data-activity-id="${act.id}" style="margin-top:12px;">Devamını Oku →</button>
            </div>
          `;

          const actions = card.querySelector('.activity-card-actions');
          if (actions && isAdmin(su)) {
            actions.innerHTML = `
              <button data-edit="${act.id}" class="secondary" style="padding:8px 12px;">Düzenle</button>
              <button data-del="${act.id}" class="danger" style="padding:8px 12px;">Sil</button>
            `;
          }

          grid.appendChild(card);
        });

        grid.querySelectorAll('.read-more').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.dataset.activityId;
            const act = activities.find((a) => String(a.id) === String(id));
            if (!act) return;
            modalTitle.textContent = act.title;
            modalBody.innerHTML = act.description || act.summary || '';
            modal.style.display = 'flex';
          });
        });

        if (isAdmin(su)) {
          grid.querySelectorAll('button[data-edit]').forEach((btn) => {
            btn.addEventListener('click', () => {
              const id = btn.dataset.edit;
              const act = activities.find((a) => String(a.id) === String(id));
              if (!act) return;
              idInput.value = act.id;
              titleInput.value = act.title;
              categoryInput.value = act.category;
              budgetInput.value = act.budget;
              summaryInput.value = act.summary;
              descInput.value = stripTags(act.description || '');
              compressedImageData = null; // Reset compressed image
              addBtn.style.display = 'none';
              saveBtn.style.display = 'inline-block';
              cancelBtn.style.display = 'inline-block';
              window.scrollTo({ top: form?.offsetTop || 0, behavior: 'smooth' });
            });
          });

          grid.querySelectorAll('button[data-del]').forEach((btn) => {
            btn.addEventListener('click', () => {
              const id = btn.dataset.del;
              if (!confirm('Bu faaliyeti silmek istiyor musunuz?')) return;
              activities = activities.filter((a) => String(a.id) !== String(id));
              saveActivities();
              renderGrid();
              renderAdminList();
            });
          });
        }
      };

      const renderAdminList = () => {
        if (!adminList) return;
        adminList.innerHTML = '';
        activities.forEach((act) => {
          const row = document.createElement('div');
          row.className = 'admin-list-row';
          row.innerHTML = `
            <div>
              <div class="row-title">${act.title}</div>
              <div class="row-sub">${act.category} • ${act.budget}</div>
            </div>
            <div class="row-actions">
              <button data-edit="${act.id}" class="secondary">Düzenle</button>
              <button data-del="${act.id}" class="danger">Sil</button>
            </div>
          `;
          adminList.appendChild(row);
        });

        adminList.querySelectorAll('button[data-edit]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.dataset.edit;
            const act = activities.find((a) => String(a.id) === String(id));
            if (!act) return;
            idInput.value = act.id;
            titleInput.value = act.title;
            categoryInput.value = act.category;
            budgetInput.value = act.budget;
            summaryInput.value = act.summary;
            descInput.value = stripTags(act.description || '');
            compressedImageData = null; // Reset compressed image
            addBtn.style.display = 'none';
            saveBtn.style.display = 'inline-block';
            cancelBtn.style.display = 'inline-block';
            window.scrollTo({ top: form?.offsetTop || 0, behavior: 'smooth' });
          });
        });

        adminList.querySelectorAll('button[data-del]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.dataset.del;
            if (!confirm('Bu faaliyeti silmek istiyor musunuz?')) return;
            activities = activities.filter((a) => String(a.id) !== String(id));
            saveActivities();
            renderGrid();
            renderAdminList();
          });
        });
      };

      const resetForm = () => {
        if (form) form.reset();
        idInput.value = '';
        addBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
        compressedImageData = null;
      };

      // Resim input change event
      if (imageInput) {
        imageInput.addEventListener('change', async (e) => {
          const file = e.target.files?.[0];
          if (!file) {
            compressedImageData = null;
            return;
          }

          try {
            compressedImageData = await compressImage(file, 600, 400, 0.8);
            alert(`✓ Resim optimize edildi (Boyut: ${(new Blob([compressedImageData]).size / 1024).toFixed(2)} KB)`);
          } catch (err) {
            alert('Resim işlenirken hata oluştu: ' + err.message);
            compressedImageData = null;
          }
        });
      }

      if (addBtn) {
        addBtn.addEventListener('click', () => {
          if (!(titleInput.value && categoryInput.value && budgetInput.value && summaryInput.value)) {
            alert('Lütfen başlık, kategori, fon hedefi ve özet alanlarını doldurun.');
            return;
          }
          if (!compressedImageData) {
            alert('Lütfen bir resim seçin.');
            return;
          }
          const newAct = {
            id: Date.now().toString(),
            title: titleInput.value.trim(),
            category: categoryInput.value.trim(),
            budget: budgetInput.value.trim(),
            image: compressedImageData,
            summary: summaryInput.value.trim(),
            description: (descInput.value || '').trim()
          };
          activities.push(newAct);
          saveActivities();
          renderGrid();
          renderAdminList();
          resetForm();
        });
      }

      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const id = idInput.value;
          const idx = activities.findIndex((a) => String(a.id) === String(id));
          if (idx === -1) return;
          
          // Eğer resim değiştirilmişse, compressed versionu kullan; değilse eski resmi tut
          const imageToUse = compressedImageData || activities[idx].image;
          
          activities[idx] = {
            id,
            title: titleInput.value.trim(),
            category: categoryInput.value.trim(),
            budget: budgetInput.value.trim(),
            image: imageToUse,
            summary: summaryInput.value.trim(),
            description: (descInput.value || '').trim()
          };
          saveActivities();
          renderGrid();
          renderAdminList();
          resetForm();
        });
      }

      if (cancelBtn) {
        cancelBtn.addEventListener('click', resetForm);
      }

      if (modal && modalClose) {
        modalClose.addEventListener('click', () => (modal.style.display = 'none'));
        window.addEventListener('click', (e) => {
          if (e.target === modal) modal.style.display = 'none';
        });
      }

      const suUser = getSessionUser();
      if (suUser && isAdmin(suUser) && adminWrapper) {
        adminWrapper.style.display = 'block';
        renderAdminList();
      }

      renderGrid();
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

    // Hakkımızda sayfası: admin CRUD
    (function initAboutPage() {
      if (currentPage !== 'about.html') return;

      const su = getSessionUser();
      const adminWrapper = document.getElementById('about-admin-wrapper');
      const editBtnWrapper = document.getElementById('about-edit-btn-wrapper');
      const editBtn = document.getElementById('aboutEditBtn');
      const container = document.getElementById('about-sections-container');
      const sectionsList = document.getElementById('about-sections-list');
      const editForm = document.getElementById('about-edit-section-form');
      const addSectionBtn = document.getElementById('aboutAddSectionBtn');
      const editSectionTitle = document.getElementById('editSectionTitle');
      const editSectionContent = document.getElementById('editSectionContent');
      const saveSectionBtn = document.getElementById('aboutSaveSectionBtn');
      const cancelSectionBtn = document.getElementById('aboutCancelSectionBtn');

      let currentEditingIndex = -1;

      // Helper: HTML'i düz metne çevir (liste/paragraf sonlarını yeni satıra dönüştürür)
      const htmlToPlain = (html) => {
        if (!html) return '';
        // Replace closing paragraph and list item tags with newlines
        let t = html.replace(/<\s*\/p\s*>/gi, '\n');
        t = t.replace(/<\s*br\s*\/?>/gi, '\n');
        t = t.replace(/<\s*\/li\s*>/gi, '\n');
        // Replace list starts with a dash marker
        t = t.replace(/<\s*li[^>]*>/gi, '- ');
        // Remove all remaining tags
        t = t.replace(/<[^>]+>/g, '');
        // Decode basic HTML entities
        t = t.replace(/&nbsp;/gi, ' ');
        t = t.replace(/&amp;/gi, '&');
        t = t.replace(/&lt;/gi, '<');
        t = t.replace(/&gt;/gi, '>');
        // Trim extra blank lines
        t = t.replace(/\n{3,}/g, '\n\n').trim();
        return t;
      };

      // Helper: düz metni basit HTML'e çevir (paragraflara sarar, listeleri korur)
      const plainToHtml = (text) => {
        if (!text) return '';
        // Normalize CRLF
        let t = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        // Lines starting with '- ' become list items
        const lines = t.split('\n');
        let inList = false;
        let out = '';
        lines.forEach((ln) => {
          const trimmed = ln.trim();
          if (trimmed.startsWith('- ')) {
            if (!inList) { out += '<ul>'; inList = true; }
            out += '<li>' + trimmed.slice(2) + '</li>';
          } else {
            if (inList) { out += '</ul>'; inList = false; }
            if (trimmed === '') {
              out += '\n';
            } else {
              out += '<p>' + trimmed + '</p>';
            }
          }
        });
        if (inList) out += '</ul>';
        return out;
      };

      // Default sections
      const defaultSections = [
        {
          id: 'kimiz',
          title: 'Kimiz?',
          content: '<p>A Derneği, toplumsal dayanışmayı güçlendiren, gönüllülüğü teşvik eden ve sürdürülebilir projelerle fark yaratan bir sivil toplum kuruluşudur. Kuruluşumuzdan itibaren, bireyleri bir araya getirerek, ortak değerler etrafında güçlü bir topluluk oluşturmayı amaçlamıştır.</p>'
        },
        {
          id: 'misyon',
          title: 'Misyonumuz',
          content: '<p>Toplumdaki sorunlara çözüm üretmek, sosyal farkındalık yaratmak ve herkesin birbirini desteklemesini sağlamak. Her bir üyemizin sesinin duyulduğu, özgür düşündüğü ve katılımcı bir ortam oluşturmaktır.</p>'
        },
        {
          id: 'vizyon',
          title: 'Vizyonumuz',
          content: '<p>Daha adil, daha eşit ve daha dayanışmacı bir toplum inşa etmek. Gönüllülerin gücüne inanıyoruz ve her bireyin toplumdaki değişimine katkı koyabileceğini biliyoruz. Birlikte güçlü olduğumuzu ve birlikte başarabileceğimizi vurgularız.</p>'
        },
        {
          id: 'degerler',
          title: 'Değerlerimiz',
          content: '<ul class="values-list"><li><strong>Dayanışma:</strong> Birbirini desteklemeye ve korumaya inanıyoruz</li><li><strong>Şeffaflık:</strong> Tüm işlemlerimizde dürüst ve açık olmayı taahhüt ederiz</li><li><strong>Katılımcılık:</strong> Her sesinin önemli olduğu demokratik bir yapı oluştururuz</li><li><strong>Sürdürülebilirlik:</strong> Uzun vadeli etki yaratmayı hedefleriz</li><li><strong>Çeşitlilik:</strong> Farklı görüşleri ve deneyimleri değerli görüyoruz</li></ul>'
        },
        {
          id: 'faaliyetler',
          title: 'Faaliyetlerimiz',
          content: '<p>Derneğimiz, eğitim programları, sosyal yardım aktiviteleri, kültürel etkinlikler ve çevre koruma projelerini yürütmektedir. Her proje, toplumda olumlu bir değişim yaratmaya yönelik olarak tasarlanmıştır.</p><p>Düzenli olarak:</p><ul class="activities-list"><li>Eğitim ve kültür etkinlikleri</li><li>Sosyal yardım kampanyaları</li><li>Gönüllülük programları</li><li>Toplum sağlığı projeleri</li><li>Çevre ve doğa koruma çalışmaları</li><li>Ağ oluşturma ve networking etkinlikleri</li></ul>'
        },
        {
          id: 'neden',
          title: 'Neden Bize Katılmalısınız?',
          content: '<p>Bir dernek üyesi olarak, sadece bir örgütün parçası olmaktan çok daha fazlasını kazanırsınız. Alanında deneyimli insanlarla çalışma, yeni beceriler öğrenme, anlamlı bağlantılar kurma ve toplumdaki değişime doğrudan katkı sağlama fırsatı bulursunuz.</p><p>Birlikte, daha iyi bir gelecek inşa edebiliriz.</p>'
        }
      ];

      const loadSections = () => {
        try {
          const stored = JSON.parse(localStorage.getItem('aboutSections') || 'null');
          if (Array.isArray(stored) && stored.length > 0) return stored;
        } catch (err) {
          // ignore parse error
        }
        return defaultSections;
      };

      let sections = loadSections();

      const saveSections = () => {
        localStorage.setItem('aboutSections', JSON.stringify(sections));
      };

      const renderSections = () => {
        if (!container) return;
        container.innerHTML = '';
        sections.forEach((section) => {
          const div = document.createElement('div');
          div.className = 'about-section';
          div.innerHTML = `<h2>${section.title}</h2>${section.content}`;
          container.appendChild(div);
        });
      };

      const renderSectionsList = () => {
        if (!sectionsList) return;
        sectionsList.innerHTML = '';
        sections.forEach((section, idx) => {
          const row = document.createElement('div');
          row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #e5e7eb;';
          row.innerHTML = `
            <div>
              <div style="font-weight:600; color:#1f2937;">${section.title}</div>
            </div>
            <div style="display:flex; gap:6px;">
              <button data-edit-idx="${idx}" class="section-edit-btn" style="padding:6px 10px; background:#3b82f6; color:white; border:none; border-radius:3px; cursor:pointer; font-size:12px;">Düzenle</button>
              <button data-del-idx="${idx}" class="section-del-btn" style="padding:6px 10px; background:#ef4444; color:white; border:none; border-radius:3px; cursor:pointer; font-size:12px;">Sil</button>
            </div>
          `;
          sectionsList.appendChild(row);
        });

        // Edit buttons
        sectionsList.querySelectorAll('.section-edit-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.editIdx);
            currentEditingIndex = idx;
            editSectionTitle.value = sections[idx].title;
            // Edit alanına ham HTML göstermeyelim; kullanıcıya düz metin sun
            editSectionContent.value = htmlToPlain(sections[idx].content);
            if (editForm) editForm.style.display = 'block';
            window.scrollTo({ top: editForm?.offsetTop || 0, behavior: 'smooth' });
          });
        });

        // Delete buttons
        sectionsList.querySelectorAll('.section-del-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.delIdx);
            if (confirm(`"${sections[idx].title}" bölümünü silmek istiyor musunuz?`)) {
              sections.splice(idx, 1);
              saveSections();
              renderSections();
              renderSectionsList();
            }
          });
        });
      };

      // Admin panel control
      if (isAdmin(su)) {
        if (editBtnWrapper) editBtnWrapper.style.display = 'block';
        if (editBtn) {
          editBtn.addEventListener('click', () => {
            if (adminWrapper) {
              adminWrapper.style.display = adminWrapper.style.display === 'none' ? 'block' : 'none';
              renderSectionsList();
            }
          });
        }
      }

      // Add new section
      if (addSectionBtn) {
        addSectionBtn.addEventListener('click', () => {
          currentEditingIndex = -1;
          editSectionTitle.value = '';
          editSectionContent.value = '';
          if (editForm) editForm.style.display = 'block';
          window.scrollTo({ top: editForm?.offsetTop || 0, behavior: 'smooth' });
        });
      }

      // Save section
      if (saveSectionBtn) {
        saveSectionBtn.addEventListener('click', () => {
          const title = editSectionTitle.value.trim();
          let content = editSectionContent.value.trim();

          if (!title) {
            alert('Lütfen başlık girin.');
            return;
          }
          if (!content) {
            alert('Lütfen içerik girin.');
            return;
          }

          // Eğer kullanıcı içerikte HTML etiketleri eklediyse olduğu gibi kaydet,
          // yoksa düz metni basit HTML'e dönüştürerek sakla.
          const looksLikeHtml = /<[^>]+>/.test(content);
          const savedContent = looksLikeHtml ? content : plainToHtml(content);

          if (currentEditingIndex === -1) {
            // New section
            const newSection = {
              id: 'section-' + Date.now(),
              title: title,
              content: savedContent
            };
            sections.push(newSection);
            alert('Yeni bölüm eklendi.');
          } else {
            // Edit existing
            sections[currentEditingIndex].title = title;
            sections[currentEditingIndex].content = savedContent;
            alert('Bölüm güncellendi.');
          }

          saveSections();
          renderSections();
          renderSectionsList();
          if (editForm) editForm.style.display = 'none';
          currentEditingIndex = -1;
        });
      }

      // Cancel editing
      if (cancelSectionBtn) {
        cancelSectionBtn.addEventListener('click', () => {
          if (editForm) editForm.style.display = 'none';
          currentEditingIndex = -1;
        });
      }

      // Initial render
      renderSections();
    })();

    // Ana sayfa: Donation bilgileri yönetimi (admin)
    (function initDonationInfoManagement() {
      if (currentPage !== '' && currentPage !== 'index.html') return;

      const su = getSessionUser();
      const adminWrapper = document.getElementById('donation-admin-wrapper');
      const editBtnWrapper = document.getElementById('donation-edit-btn-wrapper');
      const editBtn = document.getElementById('donationEditBtn');
      const donationForm = document.getElementById('donationForm');
      const bankNameInput = document.getElementById('editBankName');
      const ibanInput = document.getElementById('editIban');
      const recipientInput = document.getElementById('editRecipient');
      const bank2NameInput = document.getElementById('editBank2Name');
      const iban2Input = document.getElementById('editIban2');
      const recipient2Input = document.getElementById('editRecipient2');
      const btcInput = document.getElementById('editBtc');
      const ethInput = document.getElementById('editEth');
      const trxInput = document.getElementById('editTrx');
      const wuInput = document.getElementById('editWesternUnion');
      const saveBtn = document.getElementById('donationSaveBtn');
      const cancelBtn = document.getElementById('donationCancelBtn');

      // Default donation info
      const defaultDonationInfo = {
        bankName: 'Türkiye Cumhuriyeti Ziraat Bankası',
        iban: 'TR33 0001 2009 7610 0012 3456 78',
        recipient: 'Ufuk Derneği',
        bank2Name: '',
        iban2: '',
        recipient2: '',
        btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        eth: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        trx: 'TXapV4386dKd9cOzq46Es1jh92dQQisAq6',
        wu: '274 581 9032'
      };

      const loadDonationInfo = () => {
        try {
          const stored = JSON.parse(localStorage.getItem('donationInfo') || 'null');
          if (stored && typeof stored === 'object') return stored;
        } catch (err) {
          // ignore parse error
        }
        return defaultDonationInfo;
      };

      let donationInfo = loadDonationInfo();

      const saveDonationInfo = () => {
        localStorage.setItem('donationInfo', JSON.stringify(donationInfo));
      };

      const renderDonationInfo = () => {
        document.getElementById('display-bank-name').textContent = donationInfo.bankName || defaultDonationInfo.bankName;
        document.getElementById('display-iban').textContent = donationInfo.iban || defaultDonationInfo.iban;
        document.getElementById('display-recipient').textContent = donationInfo.recipient || defaultDonationInfo.recipient;
        document.getElementById('display-btc').textContent = donationInfo.btc || defaultDonationInfo.btc;
        document.getElementById('display-eth').textContent = donationInfo.eth || defaultDonationInfo.eth;
        document.getElementById('display-trx').textContent = donationInfo.trx || defaultDonationInfo.trx;
        document.getElementById('display-wu').textContent = donationInfo.wu || defaultDonationInfo.wu;

        // 2. Banka bilgileri
        const bank2Section = document.getElementById('bank2-section');
        if (donationInfo.bank2Name || donationInfo.iban2 || donationInfo.recipient2) {
          bank2Section.style.display = 'block';
          document.getElementById('display-bank2-name').textContent = donationInfo.bank2Name || '';
          document.getElementById('display-iban2').textContent = donationInfo.iban2 || '';
          document.getElementById('display-recipient2').textContent = donationInfo.recipient2 || '';
        } else {
          bank2Section.style.display = 'none';
        }
      };

      const loadFormData = () => {
        bankNameInput.value = donationInfo.bankName || defaultDonationInfo.bankName;
        ibanInput.value = donationInfo.iban || defaultDonationInfo.iban;
        recipientInput.value = donationInfo.recipient || defaultDonationInfo.recipient;
        bank2NameInput.value = donationInfo.bank2Name || '';
        iban2Input.value = donationInfo.iban2 || '';
        recipient2Input.value = donationInfo.recipient2 || '';
        btcInput.value = donationInfo.btc || defaultDonationInfo.btc;
        ethInput.value = donationInfo.eth || defaultDonationInfo.eth;
        trxInput.value = donationInfo.trx || defaultDonationInfo.trx;
        wuInput.value = donationInfo.wu || defaultDonationInfo.wu;
      };

      const resetForm = () => {
        if (adminWrapper) adminWrapper.style.display = 'none';
        loadFormData();
      };

      // Admin panelini göster/gizle
      if (isAdmin(su)) {
        if (editBtnWrapper) editBtnWrapper.style.display = 'block';
        if (editBtn) {
          editBtn.addEventListener('click', () => {
            if (adminWrapper) {
              adminWrapper.style.display = adminWrapper.style.display === 'none' ? 'block' : 'none';
              loadFormData();
            }
          });
        }
      }

      // Kaydet butonu
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const bankName = bankNameInput.value.trim();
          const iban = ibanInput.value.trim();
          const recipient = recipientInput.value.trim();
          const bank2Name = bank2NameInput.value.trim();
          const iban2 = iban2Input.value.trim();
          const recipient2 = recipient2Input.value.trim();
          const btc = btcInput.value.trim();
          const eth = ethInput.value.trim();
          const trx = trxInput.value.trim();
          const wu = wuInput.value.trim();

          if (!bankName || !iban || !recipient) {
            alert('Lütfen Banka, IBAN ve Alıcı Adı alanlarını doldurun.');
            return;
          }

          donationInfo = {
            bankName: bankName || defaultDonationInfo.bankName,
            iban: iban || defaultDonationInfo.iban,
            recipient: recipient || defaultDonationInfo.recipient,
            bank2Name: bank2Name || '',
            iban2: iban2 || '',
            recipient2: recipient2 || '',
            btc: btc || defaultDonationInfo.btc,
            eth: eth || defaultDonationInfo.eth,
            trx: trx || defaultDonationInfo.trx,
            wu: wu || defaultDonationInfo.wu
          };

          saveDonationInfo();
          renderDonationInfo();
          alert('Banka ve kripto bilgileri başarıyla güncellendi.');
          resetForm();
        });
      }

      // İptal butonu
      if (cancelBtn) {
        cancelBtn.addEventListener('click', resetForm);
      }

      // İlk yükleme
      renderDonationInfo();
    })();

    // Ana sayfa: "Neden Bize Katılmalısınız?" yönetimi (admin)
    (function initWhyJoinManagement() {
      if (currentPage !== '' && currentPage !== 'index.html') return;

      const su = getSessionUser();
      const adminWrapper = document.getElementById('why-admin-wrapper');
      const editBtnWrapper = document.getElementById('why-edit-btn-wrapper');
      const editBtn = document.getElementById('whyEditBtn');
      const saveBtn = document.getElementById('whySaveBtn');
      const cancelBtn = document.getElementById('whyCancelBtn');
      const addCardBtn = document.getElementById('whyAddCardBtn');
      const cardsEditContainer = document.getElementById('why-cards-edit-container');
      const cardsDisplay = document.getElementById('why-cards-display');

      // Default why join cards
      const defaultWhyCards = [
        {
          icon: '👥',
          title: 'Güçlü Bir Topluluk',
          text: 'Benzer hedeflere ve değerlere sahip bireylerle tanışın, dayanışma içinde güçlü bağlar kurun.'
        },
        {
          icon: '📈',
          title: 'Gelişim Fırsatları',
          text: 'Özel etkinlikler, atölyeler ve networking fırsatlarıyla kendinizi geliştirin.'
        },
        {
          icon: '💚',
          title: 'Fark Yaratın',
          text: 'Toplumda olumlu değişim yaratan anlamlı projelere katkı sağlayın.'
        }
      ];

      const loadWhyCards = () => {
        try {
          const stored = JSON.parse(localStorage.getItem('whyCards') || 'null');
          if (stored && Array.isArray(stored) && stored.length > 0) return stored;
        } catch (err) {
          // ignore parse error
        }
        return defaultWhyCards;
      };

      let whyCards = loadWhyCards();

      const saveWhyCards = () => {
        localStorage.setItem('whyCards', JSON.stringify(whyCards));
      };

      const renderWhyCardsDisplay = () => {
        cardsDisplay.innerHTML = '';
        whyCards.forEach((card, index) => {
          const cardEl = document.createElement('div');
          cardEl.className = 'why-card';
          cardEl.innerHTML = `
            <div class="icon">${card.icon}</div>
            <h3>${card.title}</h3>
            <p>${card.text}</p>
          `;
          cardsDisplay.appendChild(cardEl);
        });
      };

      const renderFormCards = () => {
        cardsEditContainer.innerHTML = '';
        whyCards.forEach((card, index) => {
          const cardDiv = document.createElement('div');
          cardDiv.style.cssText = 'background:white; padding:15px; border-radius:6px; border:1px solid #d1d5db; position:relative;';
          cardDiv.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <h4 style="margin:0; color:#334155;">Kart ${index + 1}</h4>
              <button type="button" class="delete-card-btn" data-index="${index}" style="padding:4px 8px; background:#ef4444; color:white; border:none; border-radius:4px; cursor:pointer; font-size:12px; font-weight:600;">✕ Sil</button>
            </div>
            <div style="margin-bottom:12px;">
              <label style="display:block; font-weight:600; margin-bottom:4px;">İkon (Emoji)</label>
              <input type="text" maxlength="2" class="card-icon-input" data-index="${index}" style="width:100%; padding:8px; border:1px solid #d1d5db; border-radius:4px; box-sizing:border-box;" placeholder="Emoji" value="${card.icon}">
            </div>
            <div style="margin-bottom:12px;">
              <label style="display:block; font-weight:600; margin-bottom:4px;">Başlık</label>
              <input type="text" class="card-title-input" data-index="${index}" style="width:100%; padding:8px; border:1px solid #d1d5db; border-radius:4px; box-sizing:border-box;" placeholder="Başlık" value="${card.title}">
            </div>
            <div>
              <label style="display:block; font-weight:600; margin-bottom:4px;">Açıklama</label>
              <textarea class="card-text-input" data-index="${index}" style="width:100%; padding:8px; border:1px solid #d1d5db; border-radius:4px; box-sizing:border-box; min-height:60px; font-family:Arial, sans-serif;" placeholder="Açıklama">${card.text}</textarea>
            </div>
          `;
          cardsEditContainer.appendChild(cardDiv);
        });

        // Delete butonlarını bağla
        document.querySelectorAll('.delete-card-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const index = parseInt(btn.dataset.index);
            whyCards.splice(index, 1);
            renderFormCards();
          });
        });
      };

      const resetForm = () => {
        if (adminWrapper) adminWrapper.style.display = 'none';
        renderFormCards();
      };

      // Admin panelini göster/gizle
      if (isAdmin(su)) {
        if (editBtnWrapper) editBtnWrapper.style.display = 'block';
        if (editBtn) {
          editBtn.addEventListener('click', () => {
            if (adminWrapper) {
              adminWrapper.style.display = adminWrapper.style.display === 'none' ? 'block' : 'none';
              renderFormCards();
            }
          });
        }
      }

      // Yeni kart ekleme butonu
      if (addCardBtn) {
        addCardBtn.addEventListener('click', (e) => {
          e.preventDefault();
          whyCards.push({
            icon: '⭐',
            title: 'Yeni Kart',
            text: 'Açıklamayı buraya yazın.'
          });
          renderFormCards();
        });
      }

      // Kaydet butonu
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const newCards = [];
          
          document.querySelectorAll('.card-icon-input').forEach((input, index) => {
            const icon = input.value.trim().substring(0, 2) || '⭐';
            const titleInput = document.querySelectorAll('.card-title-input')[index];
            const textInput = document.querySelectorAll('.card-text-input')[index];
            
            const title = titleInput.value.trim();
            const text = textInput.value.trim();

            if (!title || !text) {
              alert(`Kart ${index + 1}: Başlık ve açıklama boş olamaz.`);
              return;
            }

            newCards.push({ icon, title, text });
          });

          if (newCards.length === 0) {
            alert('En az bir kart olmalı!');
            return;
          }

          whyCards = newCards;
          saveWhyCards();
          renderWhyCardsDisplay();
          alert('Kartlar başarıyla güncellendi.');
          resetForm();
        });
      }

      // İptal butonu
      if (cancelBtn) {
        cancelBtn.addEventListener('click', resetForm);
      }

      // İlk yükleme
      renderWhyCardsDisplay();
      if (isAdmin(su)) {
        renderFormCards();
      }
    })();

    // Menü Yönetimi
    (function initMenuManagement() {
      const defaultMenuItems = [
        { id: 'home', label: 'Ana Sayfa', url: 'index.html', active: true, order: 1 },
        { id: 'about', label: 'Hakkımızda', url: 'about.html', active: true, order: 2 },
        { id: 'management', label: 'Yönetim', url: 'management.html', active: true, order: 3 },
        { id: 'announcements', label: 'Duyurular', url: 'announcements.html', active: true, order: 4 },
        { id: 'activities', label: 'Faaliyetlerimiz', url: 'activities.html', active: true, order: 5 },
        { id: 'contact', label: 'İletişim', url: 'contact.html', active: true, order: 6 }
      ];

      const MENU_STORAGE_KEY = 'navigationMenu';
      const PAGES_STORAGE_KEY = 'customPages';

      window.getMenuItems = function() {
        try {
          const stored = JSON.parse(localStorage.getItem(MENU_STORAGE_KEY) || 'null');
          if (Array.isArray(stored) && stored.length > 0) return stored;
        } catch (err) {
          // ignore parse error
        }
        return defaultMenuItems;
      };

      window.saveMenuItems = function(items) {
        localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
      };

      window.getPageContent = function(pageId) {
        try {
          const pages = JSON.parse(localStorage.getItem(PAGES_STORAGE_KEY) || '{}');
          return pages[pageId] || null;
        } catch (err) {
          return null;
        }
      };

      window.savePageContent = function(pageId, content) {
        const pages = JSON.parse(localStorage.getItem(PAGES_STORAGE_KEY) || '{}');
        pages[pageId] = content;
        localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(pages));
      };

      const getDefaultPageContent = (label) => {
        return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <title>${label} - Dernek Websitesi</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header class="navbar">
    <div class="logo"><a href="index.html" class="logo-link">UFUK DERNEĞİ</a></div>
    <nav id="navbar-nav"></nav>
  </header>

  <section class="hero">
    <h1>${label}</h1>
    <p>Bu sayfanın içeriğini admin panelinden düzenleyebilirsiniz.</p>
  </section>

  <section class="content">
    <div id="page-content" style="max-width:1200px; margin:0 auto; padding:40px 20px;">
      <p style="text-align:center; color:#666; font-size:18px;">Sayfa içeriği yükleniyor...</p>
    </div>
  </section>

  <footer class="footer">
    <div class="footer-content">
      <p>&copy; 2024 Ufuk Derneği. Tüm hakları saklıdır.</p>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>`;
      };

      window.renderMenu = function() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        
        const menuItems = window.getMenuItems().filter(m => m.active).sort((a, b) => a.order - b.order);
        
        // Mevcut menü linklerini bul ve güncelle
        const existingLinks = nav.querySelectorAll('a[href$=".html"]');
        const themeBtn = nav.querySelector('#theme-toggle');
        const loginBtn = nav.querySelector('#userLoginBtn');
        
        // Tüm HTML linklerini kaldır (theme ve login button'ı hariç)
        existingLinks.forEach(link => {
          if (link !== loginBtn) {
            link.remove();
          }
        });
        
        // Yeni menü linklerini ekle (theme button'dan önce)
        const insertBeforeElement = themeBtn || loginBtn;
        menuItems.forEach(item => {
          const a = document.createElement('a');
          // Dinamik sayfaları yüklemek için # kullan
          a.href = 'javascript:void(0)';
          a.textContent = item.label;
          a.dataset.menuId = item.id;
          a.dataset.pageUrl = item.url;
          a.style.cursor = 'pointer';
          // Dinamik sayfa yükleme
          a.addEventListener('click', (e) => {
            e.preventDefault();
            const pageUrl = item.url;
            const pageId = pageUrl.replace('.html', '');
            const pageContent = window.getPageContent(pageId);
            
            if (pageContent) {
              // localStorage'a sayfa bilgisini kaydet
              localStorage.setItem('_dynamicPageId', pageId);
              localStorage.setItem('_dynamicPageLabel', item.label);
              localStorage.setItem('_dynamicPageContent', pageContent);
              
              // page.html'e yönlendir (query param ile sayfa ID'sini geç)
              window.location.href = 'page.html?id=' + encodeURIComponent(pageId);
            } else {
              // Normal sayfa açması
              window.location.href = pageUrl;
            }
          });
          if (insertBeforeElement) {
            nav.insertBefore(a, insertBeforeElement);
          } else {
            nav.appendChild(a);
          }
        });
      };

      // Sayfa yüklendiğinde menüyü renderla
      window.renderMenu();

      // Management sayfasında admin paneli
      if (currentPage === 'management.html') {
        const su = getSessionUser();
        if (isAdmin(su)) {
          const adminArea = document.querySelector('[data-admin-only]');
          if (adminArea) {
            // Menü yönetim panelini ekle
            const menuManagerDiv = document.createElement('div');
            menuManagerDiv.id = 'admin-menu-manager';
            menuManagerDiv.style.cssText = `
              margin-top:30px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding:30px; 
              border-radius:12px; 
              box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
              color: white;
            `;
            menuManagerDiv.innerHTML = `
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
                <span style="font-size:32px;">📋</span>
                <h3 style="margin:0; font-size:24px; color:white;">Menü Yönetimi</h3>
              </div>
              <p style="margin:0 0 20px 0; font-size:15px; color:rgba(255,255,255,0.9);">Üst menüdeki sayfaları yönetebilirsiniz. Aktif/pasif yapabilir, silebilir ve yeni sayfalar ekleyebilirsiniz.</p>
              
              <div style="background:rgba(255,255,255,0.95); color:#1f2937; border-radius:10px; overflow:hidden; margin-bottom:20px; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
                <div style="background:#f3f4f6; padding:15px; font-weight:700; font-size:14px; display:grid; grid-template-columns:1fr 1fr auto; gap:12px; align-items:center; border-bottom:2px solid #e5e7eb;">
                  <div>📄 Sayfa Adı</div>
                  <div>🔗 URL</div>
                  <div>⚙️ İşlemler</div>
                </div>
                <div id="menuItemsList" style="max-height:400px; overflow-y:auto;"></div>
              </div>
              
              <form id="menuAddForm" style="background:rgba(255,255,255,0.95); color:#1f2937; padding:20px; border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
                <h4 style="margin:0 0 15px 0; color:#667eea; font-size:16px;">➕ Yeni Sayfa Ekle</h4>
                <div style="display:grid; gap:10px;">
                  <input type="text" id="menuNewLabel" placeholder="Sayfa Adı (örn: Galeri)" required style="padding:10px 12px; border:1px solid #d1d5db; border-radius:6px; font-size:14px; font-family:inherit;" />
                  <input type="text" id="menuNewUrl" style="display:none;" />
                </div>
                <button type="submit" style="width:100%; margin-top:10px; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:white; border:none; padding:12px; border-radius:6px; cursor:pointer; font-weight:600; font-size:14px; transition:transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">Sayfayı Ekle</button>
              </form>
            `;
            adminArea.appendChild(menuManagerDiv);

            // Menü listesini renderla
            const renderMenuList = () => {
              const menuList = document.getElementById('menuItemsList');
              if (!menuList) return;
              
              const items = window.getMenuItems().sort((a, b) => a.order - b.order);
              menuList.innerHTML = '';
              
              items.forEach((item, idx) => {
                const row = document.createElement('div');
                row.style.cssText = `
                  display:grid; 
                  grid-template-columns:1fr 1fr auto; 
                  gap:12px; 
                  align-items:center; 
                  padding:15px; 
                  border-bottom:1px solid #f3f4f6;
                  transition: background 0.2s;
                 `;
                row.onmouseover = () => row.style.background = '#f9fafb';
                row.onmouseout = () => row.style.background = 'transparent';
                
                const statusText = item.active ? '✅ Aktif' : '⏸️ Pasif';
                const statusColor = item.active ? '#10b981' : '#f59e0b';
                
                row.innerHTML = `
                  <div>
                    <div style="font-weight:600; color:#1f2937; font-size:15px;">${item.label}</div>
                  </div>
                  <div>
                    <div style="font-size:13px; color:#666; font-family:monospace; background:#f3f4f6; padding:6px 8px; border-radius:4px;">${item.url}</div>
                  </div>
                  <div style="display:flex; gap:8px;">
                    <button class="menu-toggle-status" data-idx="${idx}" style="background:${statusColor}; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600; transition:all 0.2s;" title="Durumu değiştir">${statusText}</button>
                    <button class="menu-delete" data-idx="${idx}" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; transition:all 0.2s;" title="Sayfayı sil">🗑️ Sil</button>
                  </div>
                `;
                
                menuList.appendChild(row);
              });

              // Toggle status
              menuList.querySelectorAll('.menu-toggle-status').forEach(btn => {
                btn.addEventListener('mouseover', () => btn.style.opacity = '0.9');
                btn.addEventListener('mouseout', () => btn.style.opacity = '1');
                btn.addEventListener('click', () => {
                  const idx = Number(btn.dataset.idx);
                  const items = window.getMenuItems();
                  items[idx].active = !items[idx].active;
                  window.saveMenuItems(items);
                  renderMenuList();
                });
              });

              // Delete menu item
              menuList.querySelectorAll('.menu-delete').forEach(btn => {
                btn.addEventListener('mouseover', () => btn.style.opacity = '0.9');
                btn.addEventListener('mouseout', () => btn.style.opacity = '1');
                btn.addEventListener('click', () => {
                  const idx = Number(btn.dataset.idx);
                  const items = window.getMenuItems();
                  if (confirm(`"${items[idx].label}" sayfasını silmek istediğinize emin misiniz?`)) {
                    items.splice(idx, 1);
                    window.saveMenuItems(items);
                    renderMenuList();
                  }
                });
              });
            };

            // Yeni sayfa ekleme
            const menuForm = document.getElementById('menuAddForm');
            const menuNewLabelInput = document.getElementById('menuNewLabel');
            const menuNewUrlInput = document.getElementById('menuNewUrl');
            
            // Sayfa adı yazılırken URL'yi otomatik oluştur
            if (menuNewLabelInput && menuNewUrlInput) {
              menuNewLabelInput.addEventListener('input', (e) => {
                const label = e.target.value.trim();
                if (label) {
                  // Türkçe karakterleri temizle ve URL-friendly format yap
                  const urlFriendly = label
                    .toLowerCase()
                    .replace(/ç/g, 'c')
                    .replace(/ğ/g, 'g')
                    .replace(/ı/g, 'i')
                    .replace(/ö/g, 'o')
                    .replace(/ş/g, 's')
                    .replace(/ü/g, 'u')
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-');
                  menuNewUrlInput.value = urlFriendly + '.html';
                }
              });
            }
            
            if (menuForm) {
              menuForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const label = menuNewLabelInput.value.trim();
                const url = menuNewUrlInput.value.trim();

                if (!label || !url) {
                  alert('Lütfen tüm alanları doldurun.');
                  return;
                }

                if (!url.endsWith('.html')) {
                  alert('URL ".html" ile bitmelidir.');
                  return;
                }

                // Varsayılan sayfa içeriğini oluştur ve kaydet
                const pageId = url.replace('.html', '');
                const defaultContent = `
                  <section style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 20px; border-radius: 12px; text-align: center; margin-bottom: 40px;">
                    <h1 style="margin: 0 0 20px 0; font-size: 36px; font-weight: 700;">${label}</h1>
                    <p style="margin: 0; font-size: 18px; opacity: 0.95; max-width: 600px; margin: 0 auto;">Bu sayfaya hoş geldiniz. Yönetim panelinden bu sayfa için içerik ekleyebilirsiniz.</p>
                  </section>
                  
                  <div style="background: #f0f4ff; border-left: 5px solid #667eea; padding: 30px; border-radius: 8px; margin-bottom: 40px;">
                    <div style="display: flex; gap: 15px; align-items: flex-start;">
                      <span style="font-size: 28px; flex-shrink: 0;">💡</span>
                      <div style="text-align: left;">
                        <h3 style="margin: 0 0 10px 0; color: #667eea; font-size: 18px;">Admin İpucu</h3>
                        <p style="margin: 0; color: #555; line-height: 1.6;">
                          Bu sayfa yeni oluşturulmuştur. <strong>Yönetim sayfasından</strong> "Sayfa Yönetimi" alanında bu sayfa için:
                        </p>
                        <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #555;">
                          <li>Özel başlıklar ve alt başlıklar ekleyebilirsiniz</li>
                          <li>Resim ve videolar ekleyebilirsiniz</li>
                          <li>Sayfa içeriğini tamamen özelleştirebilirsiniz</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                    <div style="background: white; border: 1px solid #e5e7eb; padding: 25px; border-radius: 8px; text-align: center;">
                      <div style="font-size: 32px; margin-bottom: 10px;">📝</div>
                      <h4 style="margin: 0 0 8px 0; color: #1f2937;">İçerik Ekle</h4>
                      <p style="margin: 0; color: #666; font-size: 14px;">Yönetim panelinden bu sayfaya metin, resim ve medya ekleyin.</p>
                    </div>
                    <div style="background: white; border: 1px solid #e5e7eb; padding: 25px; border-radius: 8px; text-align: center;">
                      <div style="font-size: 32px; margin-bottom: 10px;">⚙️</div>
                      <h4 style="margin: 0 0 8px 0; color: #1f2937;">Düzenle</h4>
                      <p style="margin: 0; color: #666; font-size: 14px;">Sayfanın tasarımını ve yerleşimini isteğinize göre özelleştirin.</p>
                    </div>
                    <div style="background: white; border: 1px solid #e5e7eb; padding: 25px; border-radius: 8px; text-align: center;">
                      <div style="font-size: 32px; margin-bottom: 10px;">✨</div>
                      <h4 style="margin: 0 0 8px 0; color: #1f2937;">Yayınla</h4>
                      <p style="margin: 0; color: #666; font-size: 14px;">Hazırladığınız içeriği canlı ortamda yayınlayın.</p>
                    </div>
                  </div>
                `;
                window.savePageContent(pageId, defaultContent);

                const items = window.getMenuItems();
                const newItem = {
                  id: 'menu-' + Date.now(),
                  label: label,
                  url: url,
                  active: true,
                  order: Math.max(...items.map(i => i.order), 0) + 1
                };
                items.push(newItem);
                window.saveMenuItems(items);
                renderMenuList();
                menuForm.reset();
                menuNewUrlInput.value = '';
                alert(`"${label}" sayfası oluşturuldu ve menüye eklendi. Sayfaya erişebilirsiniz: ${url}`);
              });
            }

            // İlk renderla
            renderMenuList();
          }
        }
      }
    })();

    // Dinamik sayfa içeriği: bölüm yönetimi (page.html)
    (function initDynamicPageSections() {
      const currentFile = window.location.pathname.split('/').pop() || '';
      if (currentFile !== 'page.html') return;

      const su = getSessionUser();
      const pageIdFromUrl = new URLSearchParams(window.location.search).get('id');
      if (!pageIdFromUrl) return;

      const adminWrapper = document.getElementById('dynamic-admin-wrapper');
      const editBtnWrapper = document.getElementById('dynamic-edit-btn-wrapper');
      const editBtn = document.getElementById('dynamicEditBtn');
      const container = document.getElementById('page-content');
      const sectionsList = document.getElementById('dynamic-sections-list');
      const editForm = document.getElementById('dynamic-edit-section-form');
      const addSectionBtn = document.getElementById('dynamicAddSectionBtn');
      const editSectionTitle = document.getElementById('dynamicEditSectionTitle');
      const editSectionContent = document.getElementById('dynamicEditSectionContent');
      const saveSectionBtn = document.getElementById('dynamicSaveSectionBtn');
      const cancelSectionBtn = document.getElementById('dynamicCancelSectionBtn');

      let currentEditingIndex = -1;

      // Helper: metni HTML'e dönüştür
      const plainToHtml = (text) => {
        if (!text) return '';
        let t = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const lines = t.split('\n');
        let inList = false;
        let out = '';
        lines.forEach((ln) => {
          const trimmed = ln.trim();
          if (trimmed.startsWith('• ')) {
            if (!inList) { out += '<ul>'; inList = true; }
            out += '<li>' + trimmed.slice(2) + '</li>';
          } else {
            if (inList) { out += '</ul>'; inList = false; }
            if (trimmed === '') {
              out += '\n';
            } else {
              out += '<p>' + trimmed + '</p>';
            }
          }
        });
        if (inList) out += '</ul>';
        return out;
      };

      // Helper: HTML'i metne dönüştür
      const htmlToPlain = (html) => {
        if (!html) return '';
        let t = html.replace(/<\s*\/p\s*>/gi, '\n');
        t = t.replace(/<\s*br\s*\/?>/gi, '\n');
        t = t.replace(/<\s*\/li\s*>/gi, '\n');
        t = t.replace(/<\s*li[^>]*>/gi, '• ');
        t = t.replace(/<[^>]+>/g, '');
        t = t.replace(/&nbsp;/gi, ' ');
        t = t.replace(/&amp;/gi, '&');
        t = t.replace(/&lt;/gi, '<');
        t = t.replace(/&gt;/gi, '>');
        t = t.replace(/\n{3,}/g, '\n\n').trim();
        return t;
      };

      // Default: hoş geldiniz
      const defaultSections = [
        {
          id: 'welcome',
          title: 'Hoş Geldiniz',
          content: '<p>Bu sayfaya hoş geldiniz. Yönetim panelinden bu sayfayı düzenleyebilirsiniz.</p>'
        }
      ];

      const loadSections = () => {
        try {
          const pages = JSON.parse(localStorage.getItem('customPages') || '{}');
          if (pages[pageIdFromUrl]) {
            // HTML'den bölümleri parse et
            const html = pages[pageIdFromUrl];
            if (html.includes('<section') || html.includes('data-section-id')) {
              // Structured bölümler
              return parseSectionsFromHtml(html);
            }
          }
        } catch (err) {
          // ignore
        }
        return defaultSections;
      };

      // HTML'den yapılandırılmış bölümleri parse et
      const parseSectionsFromHtml = (html) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const sections = [];
        const sectionDivs = temp.querySelectorAll('[data-section-id]');
        sectionDivs.forEach((sec) => {
          const id = sec.getAttribute('data-section-id');
          const title = sec.querySelector('[data-section-title]')?.textContent || 'Bölüm';
          const content = sec.querySelector('[data-section-content]')?.innerHTML || '';
          sections.push({ id, title, content });
        });
        return sections.length > 0 ? sections : defaultSections;
      };

      let sections = loadSections();

      const saveSections = () => {
        // Bölümleri yapılandırılmış HTML'e çevir
        let html = '';
        sections.forEach((sec) => {
          html += `<section data-section-id="${sec.id}" style="margin-bottom:30px;"><h2 data-section-title="${sec.title}">${sec.title}</h2><div data-section-content>${sec.content}</div></section>`;
        });
        const customPages = JSON.parse(localStorage.getItem('customPages') || '{}');
        customPages[pageIdFromUrl] = html;
        localStorage.setItem('customPages', JSON.stringify(customPages));
      };

      const renderSections = () => {
        if (!container) return;
        container.innerHTML = '';
        sections.forEach((section) => {
          const div = document.createElement('section');
          div.setAttribute('data-section-id', section.id);
          div.style.marginBottom = '30px';
          div.innerHTML = `<h2 data-section-title="${section.title}">${section.title}</h2><div data-section-content>${section.content}</div>`;
          container.appendChild(div);
        });
      };

      const renderSectionsList = () => {
        if (!sectionsList) return;
        sectionsList.innerHTML = '';
        sections.forEach((section, index) => {
          const div = document.createElement('div');
          div.style.cssText = 'display:flex; gap:8px; margin-bottom:8px; padding:8px; background:#f3f4f6; border-radius:4px; align-items:center;';
          div.innerHTML = `
            <span style="flex:1; font-weight:500;">${section.title}</span>
            <button data-edit="${index}" type="button" style="padding:4px 8px; background:#3b82f6; color:white; border:none; border-radius:3px; cursor:pointer; font-size:12px;">Düzenle</button>
            <button data-delete="${index}" type="button" style="padding:4px 8px; background:#ef4444; color:white; border:none; border-radius:3px; cursor:pointer; font-size:12px;">Sil</button>
          `;
          sectionsList.appendChild(div);

          // Düzenle
          div.querySelector(`[data-edit]`).addEventListener('click', () => {
            currentEditingIndex = index;
            editSectionTitle.value = section.title;
            editSectionContent.value = htmlToPlain(section.content);
            editForm.style.display = 'block';
          });

          // Sil
          div.querySelector(`[data-delete]`).addEventListener('click', () => {
            if (confirm(`"${section.title}" bölümü silinsin mi?`)) {
              sections.splice(index, 1);
              saveSections();
              renderSections();
              renderSectionsList();
            }
          });
        });
      };

      // Admin kontrol
      if (isAdmin(su)) {
        if (adminWrapper) adminWrapper.style.display = 'block';
        if (editBtnWrapper) editBtnWrapper.style.display = 'none';
      } else {
        if (adminWrapper) adminWrapper.style.display = 'none';
        if (editBtnWrapper) editBtnWrapper.style.display = 'none';
      }

      // Düzenle butonu (admin değilse)
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          if (adminWrapper) adminWrapper.style.display = 'block';
          if (editBtnWrapper) editBtnWrapper.style.display = 'none';
        });
      }

      // Yeni bölüm ekle
      if (addSectionBtn) {
        addSectionBtn.addEventListener('click', () => {
          currentEditingIndex = -1;
          editSectionTitle.value = '';
          editSectionContent.value = '';
          editForm.style.display = 'block';
        });
      }

      // Kaydet
      if (saveSectionBtn) {
        saveSectionBtn.addEventListener('click', () => {
          const title = editSectionTitle.value.trim();
          const content = plainToHtml(editSectionContent.value);

          if (!title) {
            alert('Başlık boş olamaz!');
            return;
          }

          if (currentEditingIndex === -1) {
            // Yeni bölüm
            sections.push({
              id: 'section-' + Date.now(),
              title,
              content
            });
          } else {
            // Mevcut bölümü güncelle
            sections[currentEditingIndex].title = title;
            sections[currentEditingIndex].content = content;
          }

          saveSections();
          renderSections();
          renderSectionsList();
          editForm.style.display = 'none';
        });
      }

      // İptal
      if (cancelSectionBtn) {
        cancelSectionBtn.addEventListener('click', () => {
          editForm.style.display = 'none';
          currentEditingIndex = -1;
        });
      }

      // İlk render
      renderSections();
      renderSectionsList();
    })();
  });
})();
