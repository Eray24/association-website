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
      // Admin girişi: Navbar'da taç + isim + çıkış ikonu göster
      if (userLoginBtn) {
        userLoginBtn.innerHTML = `<span style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 24px;">👑</span>
          <span>${su.firstName}</span>
          <span id="logoutIcon" style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; cursor: pointer; margin-left: 4px; border-left: 2px solid rgba(133, 77, 14, 0.3); padding-left: 12px;" title="Çıkış Yap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </span>
        </span>`;
        userLoginBtn.href = "#";
        userLoginBtn.style.background =
          "linear-gradient(135deg, #ffd700, #ffed4e)";
        userLoginBtn.style.color = "#854d0e";
        userLoginBtn.style.fontWeight = "700";
        userLoginBtn.style.padding = "10px 20px";
        userLoginBtn.style.borderRadius = "25px";
        userLoginBtn.style.boxShadow = "0 4px 15px rgba(255, 215, 0, 0.3)";

        // Sadece çıkış ikonuna tıklayınca çıkış yapsın
        const logoutIcon = document.getElementById("logoutIcon");
        if (logoutIcon) {
          logoutIcon.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            sessionStorage.removeItem("user");
            alert("Çıkış yapıldı");
            window.location.reload();
          });
        }
      }
    } else if (su) {
      console.log("Member login detected!");
      // Normal üye girişi: İsim + çıkış ikonu göster
      if (userLoginBtn) {
        userLoginBtn.innerHTML = `<span style="display: flex; align-items: center; gap: 12px;">
          <span>👤 ${su.firstName}</span>
          <span id="logoutIcon" style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; cursor: pointer; margin-left: 4px; border-left: 2px solid rgba(255, 255, 255, 0.3); padding-left: 12px;" title="Çıkış Yap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </span>
        </span>`;
        userLoginBtn.href = "#";

        // Sadece çıkış ikonuna tıklayınca çıkış yapsın
        const logoutIcon = document.getElementById("logoutIcon");
        if (logoutIcon) {
          logoutIcon.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            sessionStorage.removeItem("user");
            alert("Çıkış yapıldı");
            window.location.reload();
          });
        }
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
