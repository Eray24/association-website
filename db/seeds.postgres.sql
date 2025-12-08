-- Seed data for association-website (PostgreSQL)
-- Uses pgcrypto's crypt() for password hashing

-- Make sure extension exists (schema file already creates it)
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users: admin and a normal user
INSERT INTO users (name, email, password_hash, role)
VALUES
('Site Admin','admin@example.com', crypt('AdminPass123!', gen_salt('bf')), 'admin'),
('Hasan Yılmaz','hasan@example.com', crypt('UserPass123!', gen_salt('bf')), 'user')
ON CONFLICT DO NOTHING;

-- Member for the normal user (assume Hasan is id 2)
INSERT INTO members (user_id, member_number)
SELECT id, 'M-0001' FROM users WHERE email = 'hasan@example.com'
ON CONFLICT DO NOTHING;

-- Plans
INSERT INTO plans (name, period, amount, description)
VALUES
('Bireysel Aylık','monthly',50.00,'Aylık aidat planı'),
('Bireysel Yıllık','yearly',500.00,'Yıllık aidat planı')
ON CONFLICT DO NOTHING;

-- Example Page
INSERT INTO pages (title, slug, content, seo, status, created_by)
VALUES ('Hakkımızda','hakkimizda','Derneğimiz hakkında bilgiler...', '{"meta_description": "Dernek hakkında kısa bilgi"}', 'published', (SELECT id FROM users WHERE email='admin@example.com'))
ON CONFLICT DO NOTHING;

-- Example Menu
INSERT INTO menus (label, page_id, sort_order, visible)
VALUES ('Hakkımızda', (SELECT id FROM pages WHERE slug='hakkimizda'), 1, true)
ON CONFLICT DO NOTHING;

-- Example Media
INSERT INTO media (filename, path, tags, uploaded_by)
VALUES ('cover.jpg', '/media/cover.jpg', ARRAY['cover','homepage'], (SELECT id FROM users WHERE email='admin@example.com'))
ON CONFLICT DO NOTHING;

-- Example Post
INSERT INTO posts (title, slug, excerpt, content, cover_media_id, status, tags, created_at)
VALUES ('İlk Duyuru','ilk-duyuru','Kısa özet','Duyuru içeriği buraya gelecek', (SELECT id FROM media WHERE filename='cover.jpg'), 'published', ARRAY['duyuru','haber'], now())
ON CONFLICT DO NOTHING;

-- Example Payment
INSERT INTO payments (member_id, type, amount, status)
VALUES (
  (SELECT id FROM members WHERE member_number='M-0001'),
  'membership', 50.00, 'completed'
)
ON CONFLICT DO NOTHING;

-- Example Expense
INSERT INTO expenses (category, amount, paid_to, notes)
VALUES ('Ofis Giderleri', 1200.00, 'Kirtasiye Ltd.', 'Ofis malzemeleri')
ON CONFLICT DO NOTHING;

-- Example Social Account
INSERT INTO social_accounts (user_id, platform, username)
VALUES ((SELECT id FROM users WHERE email='hasan@example.com'), 'twitter', 'hasanyilmaz')
ON CONFLICT DO NOTHING;

-- Example Audit Log
INSERT INTO audit_logs (actor_id, action, record_type, record_id, changes)
VALUES ((SELECT id FROM users WHERE email='admin@example.com'), 'create_user', 'users', (SELECT id FROM users WHERE email='hasan@example.com'), '{"fields": {"email":"hasan@example.com"}}')
ON CONFLICT DO NOTHING;

-- End of seeds
