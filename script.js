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

    // Ana sayfada admin badge göster
    const adminBadge = document.getElementById("adminBadge");
    const adminName = document.getElementById("adminName");
    const userLoginBtn = document.getElementById("userLoginBtn");
    if (su && isAdmin(su)) {
      if (adminBadge) {
        adminBadge.style.display = "block";
        if (adminName) {
          adminName.textContent = `${su.firstName} ${su.lastName}`;
        }
      }
      if (userLoginBtn) {
        userLoginBtn.textContent = "Çıkış Yap";
        userLoginBtn.href = "#";
        userLoginBtn.addEventListener("click", (e) => {
          e.preventDefault();
          sessionStorage.removeItem("user");
          alert("Çıkış yapıldı");
          window.location.reload();
        });
      }
    } else if (su) {
      // Normal üye girişi
      if (userLoginBtn) {
        userLoginBtn.textContent = `👤 ${su.firstName}`;
        userLoginBtn.href = "#";
        userLoginBtn.addEventListener("click", (e) => {
          e.preventDefault();
          sessionStorage.removeItem("user");
          alert("Çıkış yapıldı");
          window.location.reload();
        });
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
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email")?.value || "";
        const password = document.getElementById("password")?.value || "";
        if (!email || !password) {
          alert("Lütfen e-posta ve şifrenizi girin.");
          return;
        }
        const users = getUsers();
        const candidate = users.find((u) => u.email === email);
        if (!candidate) {
          alert("Kullanıcı bulunamadı");
          return;
        }

        // Demo admin bypass kontrolü
        if (email === "admin@dernek.org" && password === "admin123") {
          setSessionUser({
            email: candidate.email,
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            role: candidate.role,
          });
          alert("Giriş başarılı");
          window.location.href = "index.html";
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
    const pageRoles = {
      "management.html": ["admin", "member"],
    };
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
