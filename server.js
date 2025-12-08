require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (site root)
app.use(express.static(path.join(__dirname)));

// PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/association_db'
});

// Helper: send standardized error
function failure(res, message = 'Kayıt gerçekleştirilemedi') {
  return res.status(400).json({ success: false, message });
}

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return failure(res, 'Lütfen tüm alanları doldurun');

    // Check existing email
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.length > 0) return failure(res, 'E-posta zaten kayıtlı');

    const hashed = await bcrypt.hash(password, 10);

    const insertUser = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role',
      [name, email, hashed, role || 'user']
    );

    const user = insertUser.rows[0];

    // If normal user, create member record
    if ((role || 'user') === 'user') {
      const memberNumber = `M-${String(1000 + user.id)}`;
      await pool.query('INSERT INTO members (user_id, member_number) VALUES ($1,$2)', [user.id, memberNumber]);
    }

    return res.json({ success: true, message: 'Kayıt başarılı', user });
  } catch (err) {
    console.error('Register error', err?.message || err);
    return failure(res);
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return failure(res, 'Lütfen e-posta ve şifre girin');

    const { rows } = await pool.query('SELECT id, name, email, password_hash, role FROM users WHERE email=$1', [email]);
    if (rows.length === 0) return failure(res, 'Kullanıcı bulunamadı');

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return failure(res, 'Geçersiz şifre');

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'change_this_secret', { expiresIn: '7d' });

    return res.json({ success: true, message: 'Giriş başarılı', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error', err?.message || err);
    return failure(res);
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
