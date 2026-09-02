const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const { generateId } = require('../utils/helpers');
require('dotenv').config();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const id = generateId('user');
    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (id, name, email, password_hash, phone) VALUES (?,?,?,?,?)',
      [id, name, email, passwordHash, phone || '']
    );

    const user = { id, name, email, phone: phone || '' };
    res.status(201).json({ success: true, user, token: signToken(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid email or password.' });

    const row = rows[0];
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password.' });

    const user = { id: row.id, name: row.name, email: row.email, phone: row.phone };
    res.json({ success: true, user, token: signToken(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// GET /api/auth/me  — current logged-in customer + addresses
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, phone, date_joined FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });
    const [addresses] = await pool.query('SELECT * FROM addresses WHERE user_id = ?', [req.user.id]);
    res.json({ ...rows[0], addresses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// PUT /api/auth/me  — update name/phone
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    await pool.query('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?', [
      name, phone, req.user.id
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// POST /api/auth/me/addresses  — add a new saved address
router.post('/me/addresses', requireAuth, async (req, res) => {
  try {
    const { label, phone, street, city, zip } = req.body;
    const id = generateId('addr');
    await pool.query(
      'INSERT INTO addresses (id, user_id, label, phone, street, city, zip) VALUES (?,?,?,?,?,?,?)',
      [id, req.user.id, label, phone, street, city, zip]
    );
    res.status(201).json({ id, label, phone, street, city, zip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add address.' });
  }
});

module.exports = router;
