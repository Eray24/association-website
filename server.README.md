Sunucu (kısa rehber)

Bu proje köküne basit bir Node.js + Express sunucusu eklendi. Sunucu statik dosyaları servis eder ve aşağıdaki API uç noktalarını sağlar:

- POST `/api/register` — Kayıt. Gönderilecek JSON: `{ firstName, lastName, email, password, phone, birthDate, interests, newsletter }`.
- POST `/api/login` — Giriş. Gönderilecek JSON: `{ email, password }`.

Çalıştırma (örnek, PowerShell):

```powershell
npm install
copy .env.example .env
npm start
```

Notlar:
- Veritabanı şemasını `db/schema.postgres.sql` ile oluşturduğunuzdan emin olun.
- Eğer `member_profiles` tablosu yoksa profil verileri eklenmeyecektir (bu opsiyonel).
