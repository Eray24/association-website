// Dark Mode Toggle
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Yerel depolamadan tema tercihini al
    const savedTheme = localStorage.getItem('theme');
    
    // Eğer kaydedilmiş tema varsa, uygula
    if (savedTheme) {
        body.classList.add(savedTheme);
        updateThemeToggle(savedTheme);
    }
    
    // Tema değiştirme butonuna tıklandığında
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            if (body.classList.contains('dark')) {
                body.classList.remove('dark');
                localStorage.setItem('theme', '');
                updateThemeToggle('light');
            } else {
                body.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                updateThemeToggle('dark');
            }
        });
    }
    
    function updateThemeToggle(theme) {
        if (themeToggle) {
            themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }
});

// Form Gönderme İşlemleri
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Giriş başarılı! (Bu demo formudur)');
            // Gerçek uygulamada sunucuya veri gönderilir
        });
    }
    
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Mesajınız gönderilmiştir. Teşekkür ederiz!');
            contactForm.reset();
        });
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (password !== confirmPassword) {
                alert('Şifreler eşleşmiyor!');
                return;
            }
            
            if (password.length < 8) {
                alert('Şifre en az 8 karakter olmalıdır!');
                return;
            }
            
            alert('Kayıt başarılı! Hoş geldiniz.');
            registerForm.reset();
            // Gerçek uygulamada sunucuya veri gönderilir
        });
    }
});

// Üye Ol Butonları
document.addEventListener('DOMContentLoaded', function() {
    const joinButtons = document.querySelectorAll('.cta button');
    joinButtons.forEach(button => {
        button.addEventListener('click', function() {
            window.location.href = 'register.html';
        });
    });
});
