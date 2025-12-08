require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from repo root
app.use(express.static(path.join(__dirname)));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/association_db'
});

// Ensure member_profiles table exists for extra profile data
async function ensureProfileTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS member_profiles (
      id SERIAL PRIMARY KEY,
      member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
      data JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  `);
}

ensureProfileTable().catch(err => console.error('ensureProfileTable error', err));

function failure(res, message = 'Kayıt gerçekleştirilemedi') {
  return res.status(400).json({ success: false, message });
}

app.post('/api/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      birthDate,
      interests,
      newsletter
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return failure(res, 'Lütfen zorunlu alanları doldurun');
    }

    // check existing
    const e = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (e.rows.length > 0) return failure(res, 'E-posta zaten kayıtlı');

    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    const hashed = await bcrypt.hash(password, 10);

    const insert = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id',
      [name, email, hashed, 'user']
    );

    const userId = insert.rows[0].id;

    // create member record
    const memberNumber = `M-${String(1000 + userId)}`;
    const mem = await pool.query(
      'INSERT INTO members (user_id, member_number) VALUES ($1,$2) RETURNING id',
      [userId, memberNumber]
    );

    const memberId = mem.rows[0].id;

    // store extra profile data as JSONB
    const profile = {
      phone: phone || null,
      birthDate: birthDate || null,
      interests: Array.isArray(interests) ? interests : (interests ? [interests] : []),
      newsletter: !!newsletter
    };

    await pool.query('INSERT INTO member_profiles (member_id, data) VALUES ($1,$2)', [memberId, profile]);

    return res.json({ success: true, message: 'Kayıt başarılı' });
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

    // minimal response (no JWT here to keep simple)
    return res.json({ success: true, message: 'Giriş başarılı', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error', err?.message || err);
    return failure(res);
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
