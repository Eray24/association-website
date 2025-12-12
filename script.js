// Client-side register/login handlers that call the server API
document.addEventListener("DOMContentLoaded", () => {
  // Backend kaldırıldı: formlar demo modunda çalışır
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

      // Demo: doğrudan başarılı kabul et
      alert("Kayıt başarılı (demo)");
      localStorage.setItem(
        "userPending",
        JSON.stringify({ firstName, lastName, email })
      );
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

      // Demo: basit doğrulama ile giriş kabul et
      const pending = localStorage.getItem("userPending");
      const user = pending ? JSON.parse(pending) : { email };
      localStorage.setItem("user", JSON.stringify(user));
      alert("Giriş başarılı (demo)");
      window.location.href = "index.html";
    });
  }
});
