const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { optionalAuth, requireAuth, requireAdmin } = require('../middleware/auth');
const { generateId } = require('../utils/helpers');

async function formatOrder(row) {
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [row.id]);
  return {
    id: row.id,
    userId: row.user_id,
    customer: {
      name: row.customer_name, email: row.customer_email, phone: row.customer_phone,
      address: row.address, city: row.city, state: row.state, zip: row.zip, country: row.country
    },
    items: items.map(i => ({
      productId: i.product_id, name: i.name, image: i.image, price: Number(i.price),
      size: i.size, color: i.color, quantity: i.quantity
    })),
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
    paymentMethod: row.payment_method,
    status: row.status,
    date: row.created_at,
    notes: row.notes
  };
}

// POST /api/orders  — place an order. Body: { items: [{productId, size, color, quantity}], name, email, phone, address, city, state, zip, country, paymentMethod, notes }
// items' price/name/image are looked up server-side from the products table — never trust client prices.
router.post('/', optionalAuth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const body = req.body;
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }

    await conn.beginTransaction();

    const resolvedItems = [];
    for (const ci of body.items) {
      const [rows] = await conn.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [ci.productId]);
      if (!rows.length) { await conn.rollback(); return res.status(400).json({ error: `Product ${ci.productId} not found.` }); }
      const product = rows[0];
      if (product.stock < ci.quantity) {
        await conn.rollback();
        return res.status(400).json({ error: `Not enough stock for ${product.name}.` });
      }
      resolvedItems.push({
        productId: product.id, name: product.name,
        image: JSON.parse(product.images || '[]')[0] || '',
        price: Number(product.price), size: ci.size, color: ci.color, quantity: ci.quantity
      });
    }

    const subtotal = resolvedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = subtotal >= 5000 ? 0 : 300;
    const total = subtotal + shipping;
    const id = generateId('ORD');

    await conn.query(
      `INSERT INTO orders (id, user_id, customer_name, customer_email, customer_phone, address, city, state, zip, country, subtotal, shipping, total, payment_method, status, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'Pending', ?)`,
      [
        id, req.user ? req.user.id : null, body.name, body.email, body.phone, body.address,
        body.city, body.state, body.zip, body.country || 'Pakistan',
        subtotal, shipping, total, body.paymentMethod || 'cod', body.notes || ''
      ]
    );

    for (const item of resolvedItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, name, image, price, size, color, quantity) VALUES (?,?,?,?,?,?,?,?)',
        [id, item.productId, item.name, item.image, item.price, item.size, item.color, item.quantity]
      );
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.productId]);
    }

    await conn.commit();
    const [orderRow] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    res.status(201).json(await formatOrder(orderRow[0]));
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to place order.' });
  } finally {
    conn.release();
  }
});

// GET /api/orders/mine  — logged-in customer's own orders
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(await Promise.all(rows.map(formatOrder)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch your orders.' });
  }
});

// GET /api/orders  (admin only) — all orders
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(await Promise.all(rows.map(formatOrder)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// GET /api/orders/:id  — order confirmation page (public by design/order id)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Order not found.' });
    res.json(await formatOrder(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order.' });
  }
});

// PATCH /api/orders/:id/status  (admin only)
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status.' });

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Order not found.' });
    res.json(await formatOrder(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

module.exports = router;
