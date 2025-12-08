Sunucu (kısa rehber)

Bu klasöre basit bir Node.js + Express sunucusu eklendi. Sunucu statik dosyaları servis eder ve aşağıdaki API uç noktalarını sağlar:

- POST `/api/register` — Kayıt. Gönderilecek JSON: `{ firstName, lastName, email, password, phone, birthDate, interests, newsletter }`.
- POST `/api/login` — Giriş. Gönderilecek JSON: `{ email, password }`.

Çalıştırma (örnek, PowerShell):

```powershell
# bağımlılıkları yükle
npm install
# örnek .env kullanarak (opsiyonel)
copy .env.example .env
# sunucuyu başlat
npm start
```

Notlar:
- Sunucu `db/schema.postgres.sql` içindeki tablolara bağlıdır; `member_profiles` tablosu sunucu tarafından otomatik oluşturulur.
- Üretimde `DATABASE_URL` ve `JWT_SECRET` gibi hassas bilgileri güvenli şekilde sağlayın.
