Bu klasörde PostgreSQL için veritabanı şeması ve tohum (seed) verileri bulunmaktadır.

Dosyalar:
- `schema.postgres.sql` — Veri tabanı tipi tanımları, tablolar, indexler ve triggerlar.
- `seeds.postgres.sql` — Örnek veri: bir `admin` ve bir normal kullanıcı, üyelik, plan vb.

Hızlı kurulum (Windows / PowerShell):

1) PostgreSQL sunucunuzda yeni bir veritabanı oluşturun (örnek: `association_db`):

```powershell
# PostgreSQL bin dizininiz PATH'te ise
createdb -U postgres association_db
```

2) Şemayı uygula:

```powershell
psql -U postgres -d association_db -f "db\schema.postgres.sql"
```

3) Tohum verileri yükle:

```powershell
psql -U postgres -d association_db -f "db\seeds.postgres.sql"
```

Notlar:
- `schema.postgres.sql` dosyası `pgcrypto` uzantısını kullanır (parola hash'leri için). Komutları çalıştıran kullanıcının `CREATE EXTENSION` izni olmalıdır.
- Örnek şifreler `seeds.postgres.sql` içinde `crypt()` ile hashlenir; gerçek ortamda güçlü parolalar kullanın ve üretim şifrelerini manuel veya güvenli bir seed yöntemiyle belirleyin.
- Eğer PostgreSQL dışı bir veritabanı kullanmak isterseniz (SQLite/MySQL), tip ve enum tanımlarını uygun şekilde değiştirmeniz gerekir. İsterseniz ben MySQL/SQLite sürümünü de hazırlayayım.

İleri adımlar:
- ORM (ör: Sequelize, TypeORM, Django ORM) kullanacaksanız bu DDL'yi referans alarak modelleri oluşturabilirim.
- Migration araçları (Flyway/knex/liquibase) için migration dosyaları oluşturabilirim.
