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

function failure(res, message = 'Kayıt gerçekleştirilemedi') {
  return res.status(400).json({ success: false, message });
}

app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, birthDate, interests, newsletter } = req.body;
    if (!firstName || !lastName || !email || !password) return failure(res, 'Lütfen zorunlu alanları doldurun');

    // check existing
    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exists.rows.length > 0) return failure(res, 'E-posta zaten kayıtlı');

    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    const hashed = await bcrypt.hash(password, 10);

    const insertUser = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id',
      [name, email, hashed, 'user']
    );
    const userId = insertUser.rows[0].id;

    // create member
    const memberNumber = `M-${String(1000 + userId)}`;
    const insertMember = await pool.query('INSERT INTO members (user_id, member_number) VALUES ($1,$2) RETURNING id', [userId, memberNumber]);
    const memberId = insertMember.rows[0].id;

    // optional profile storage (if table exists)
    try {
      await pool.query('INSERT INTO member_profiles (member_id, data) VALUES ($1,$2)', [memberId, { phone: phone || null, birthDate: birthDate || null, interests: interests || null, newsletter: !!newsletter }]);
    } catch (e) {
      // ignore if table doesn't exist
    }

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

    return res.json({ success: true, message: 'Giriş başarılı', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error', err?.message || err);
    return failure(res);
  }
});

const fs = require('fs');
const MEMBERS_FILE = path.join(__dirname, 'members.json');

function readMembersFile() {
  try {
    const txt = fs.readFileSync(MEMBERS_FILE, 'utf8');
    return JSON.parse(txt || '[]');
  } catch (e) {
    return [];
  }
}

function writeMembersFile(arr) {
  try {
    fs.writeFileSync(MEMBERS_FILE, JSON.stringify(arr, null, 2));
  } catch (e) {
    console.error('writeMembersFile error', e?.message || e);
  }
}

// Get members (DB if available, otherwise JSON file)
app.get('/api/members', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, position, bio, contact FROM members ORDER BY id');
    return res.json({ members: rows });
  } catch (err) {
    const members = readMembersFile();
    return res.json({ members });
  }
});

// Create member
app.post('/api/members', async (req, res) => {
  try {
    const { name, position, bio, contact } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'İsim gerekli' });
    try {
      const insert = await pool.query('INSERT INTO members (name, position, bio, contact) VALUES ($1,$2,$3,$4) RETURNING id', [name, position || null, bio || null, contact || null]);
      return res.json({ success: true, id: insert.rows[0].id });
    } catch (e) {
      // fallback to file
      const members = readMembersFile();
      const id = members.length ? Math.max(...members.map(m => m.id)) + 1 : 1;
      const m = { id, name, position: position || '', bio: bio || '', contact: contact || '' };
      members.push(m);
      writeMembersFile(members);
      return res.json({ success: true, id });
    }
  } catch (err) {
    console.error('POST /api/members error', err?.message || err);
    return failure(res);
  }
});

// Update member
app.put('/api/members/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, position, bio, contact } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'İsim gerekli' });
    try {
      await pool.query('UPDATE members SET name=$1, position=$2, bio=$3, contact=$4 WHERE id=$5', [name, position || null, bio || null, contact || null, id]);
      return res.json({ success: true });
    } catch (e) {
      const members = readMembersFile();
      const idx = members.findIndex((x) => String(x.id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: 'Üye bulunamadı' });
      members[idx] = { id: members[idx].id, name, position: position || '', bio: bio || '', contact: contact || '' };
      writeMembersFile(members);
      return res.json({ success: true });
    }
  } catch (err) {
    console.error('PUT /api/members error', err?.message || err);
    return failure(res);
  }
});

// Delete member
app.delete('/api/members/:id', async (req, res) => {
  try {
    const id = req.params.id;
    try {
      await pool.query('DELETE FROM members WHERE id=$1', [id]);
      return res.json({ success: true });
    } catch (e) {
      const members = readMembersFile();
      const idx = members.findIndex((x) => String(x.id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: 'Üye bulunamadı' });
      members.splice(idx, 1);
      writeMembersFile(members);
      return res.json({ success: true });
    }
  } catch (err) {
    console.error('DELETE /api/members error', err?.message || err);
    return failure(res);
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
