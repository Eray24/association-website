Server (API) çalışma talimatları

Bu proje kökünde basit bir Node.js + Express sunucusu eklendi. Sunucu aynı zamanda statik siteyi servis eder ve aşağıdaki API uç noktalarını sağlar:

- POST `/api/register` — Kullanıcı kaydı. Gönderilecek JSON: `{ name, email, password, role }`. Dönen: `{ success, message, user }`.
- POST `/api/login` — Giriş. Gönderilecek JSON: `{ email, password }`. Dönen: `{ success, message, token, user }`.

Çalıştırma:

1) Ortam değişkenleri (isteğe bağlı):
- `DATABASE_URL` — PostgreSQL bağlantı dizesi. Örnek: `postgresql://postgres:postgres@localhost:5432/association_db`
- `JWT_SECRET` — JWT için gizli anahtar (varsayılan: `change_this_secret`)

2) Bağımlılıkları kur:

```powershell
npm install
```

3) Sunucuyu başlatın:

```powershell
npm start
```

Geliştirme modunda (otomatik yeniden başlatma):

```powershell
npm run dev
```

Notlar:
- Veritabanı şemasını `db/schema.postgres.sql` ile oluşturduğunuzdan emin olun.
- `register` isteği başarılı olduğunda kullanıcı `users` tablosuna kaydedilir; normal kullanıcıysa `members` tablosuna da bir kayıt eklenir.
- Üretimde `JWT_SECRET` ve veritabanı şifresi gibi hassas bilgileri güvenli şekilde sağlayın.
