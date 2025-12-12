// LocalStorage tabanlı kullanıcı ve oturum yönetimi (backend yok)
document.addEventListener("DOMContentLoaded", () => {
  // Basit yardımcılar
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

  // Basit SHA-256 hash (gösterim amaçlı; gerçek güvenlik sağlamaz)
  async function hashPassword(pw) {
    const enc = new TextEncoder().encode(pw);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    const arr = Array.from(new Uint8Array(buf));
    return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
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
      const confirm = document.getElementById("confirm-password")?.value || "";
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
      const passwordHash = await hashPassword(password);
      if (candidate.passwordHash !== passwordHash) {
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

  // Korunan sayfalar için basit kontrol (örnek: management.html)
  const protectedPages = ["management.html"];
  const path = location.pathname.split("/").pop();
  if (protectedPages.includes(path)) {
    const su = getSessionUser();
    if (!su) {
      alert("Bu sayfa için giriş yapmalısınız");
      window.location.href = "login.html";
    }
  }
});
