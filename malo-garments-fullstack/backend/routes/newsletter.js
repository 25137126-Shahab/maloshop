const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// POST /api/newsletter  { email }
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const [existing] = await pool.query('SELECT id FROM newsletter WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'This email is already subscribed.' });

    await pool.query('INSERT INTO newsletter (email) VALUES (?)', [email]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Subscription failed.' });
  }
});

module.exports = router;
