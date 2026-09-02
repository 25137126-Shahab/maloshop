const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { requireAdmin } = require('../middleware/auth');
require('dotenv').config();

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM admin_users WHERE username = ?', [username]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid username or password.' });

    const admin = rows[0];
    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid username or password.' });

    const token = jwt.sign(
      { id: admin.id, username: admin.username, name: admin.name },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '1d' }
    );
    res.json({ success: true, token, admin: { id: admin.id, username: admin.username, name: admin.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Admin login failed.' });
  }
});

// GET /api/admin/me  — verify current admin session
router.get('/me', requireAdmin, (req, res) => {
  res.json(req.admin);
});

// GET /api/admin/customers  — all registered customers with order stats
router.get('/customers', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone, u.date_joined,
             COUNT(o.id) AS order_count,
             COALESCE(SUM(CASE WHEN o.status != 'Cancelled' THEN o.total ELSE 0 END), 0) AS lifetime_spend
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      GROUP BY u.id
      ORDER BY u.date_joined DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch customers.' });
  }
});

// GET /api/admin/customers/:id  — one customer's full order history + addresses
router.get('/customers/:id', requireAdmin, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, phone, date_joined FROM users WHERE id = ?', [req.params.id]);
    if (!users.length) return res.status(404).json({ error: 'Customer not found.' });
    const [addresses] = await pool.query('SELECT * FROM addresses WHERE user_id = ?', [req.params.id]);
    const [orderRows] = await pool.query(
      'SELECT id, status, total, created_at AS date FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    const orders = orderRows.map(o => ({ id: o.id, status: o.status, total: Number(o.total), date: o.date }));
    res.json({ ...users[0], addresses, orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch customer.' });
  }
});

// GET /api/admin/stats  — dashboard numbers
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) as totalProducts FROM products');
    const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) as totalOrders FROM orders');
    const [[{ totalCustomers }]] = await pool.query('SELECT COUNT(*) as totalCustomers FROM users');
    const [[{ totalRevenue }]] = await pool.query(
      "SELECT COALESCE(SUM(total),0) as totalRevenue FROM orders WHERE status != 'Cancelled'"
    );
    const [[{ lowStock }]] = await pool.query('SELECT COUNT(*) as lowStock FROM products WHERE stock < 10');

    const [statusCounts] = await pool.query(`
      SELECT status, COUNT(*) as count FROM orders GROUP BY status
    `);
    const statusMap = Object.fromEntries(statusCounts.map(s => [s.status, s.count]));

    const [monthly] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%b %Y') as month, SUM(total) as revenue, COUNT(*) as orders
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY DATE_FORMAT(created_at, '%Y-%m') ASC
    `);

    const [categoryBreakdown] = await pool.query(`
      SELECT c.name, COUNT(p.id) as count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
    `);

    res.json({
      totalProducts, totalOrders, totalCustomers, totalRevenue: Number(totalRevenue), lowStock,
      pendingOrders: statusMap.Pending || 0,
      processingOrders: statusMap.Processing || 0,
      shippedOrders: statusMap.Shipped || 0,
      deliveredOrders: statusMap.Delivered || 0,
      monthlyRevenue: monthly.map(m => ({ month: m.month, revenue: Number(m.revenue), orders: m.orders })),
      categoryBreakdown
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

module.exports = router;
