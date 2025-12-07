// Giriş formu demo: Kullanıcı giriş yaptıktan sonra welcome.html'ye yönlendir
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      if (email && password) {
        localStorage.setItem("userEmail", email);
        window.location.href = "welcome.html";
      } else {
        alert("Lütfen e-posta ve şifrenizi girin.");
      }
    });
  }
});
