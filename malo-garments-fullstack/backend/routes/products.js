const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireAdmin } = require('../middleware/auth');
const { generateId } = require('../utils/helpers');

// Helper: turn a DB row into the same shape the frontend already expects
function formatProduct(row) {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    originalPrice: Number(row.original_price),
    category: row.category_id,
    subcategory: row.subcategory_id,
    sizes: row.sizes || [],
    colors: row.colors || [],
    stock: row.stock,
    images: row.images || [],
    description: row.description,
    rating: Number(row.rating),
    reviews: row.reviews,
    dateAdded: row.date_added,
    featured: !!row.featured,
    onSale: !!row.on_sale
  };
}

// GET /api/products  — list with optional filter/search/sort query params
// ?category=cat-1&subcategory=sub-1&minPrice=&maxPrice=&sizes=S,M&colors=Black&onSale=true&sort=price-asc&q=dress
router.get('/', async (req, res) => {
  try {
    const { category, subcategory, minPrice, maxPrice, sizes, colors, onSale, sort, q } = req.query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) { sql += ' AND category_id = ?'; params.push(category); }
    if (subcategory) { sql += ' AND subcategory_id = ?'; params.push(subcategory); }
    if (onSale === 'true') { sql += ' AND on_sale = TRUE'; }
    if (minPrice) { sql += ' AND price >= ?'; params.push(Number(minPrice)); }
    if (maxPrice) { sql += ' AND price <= ?'; params.push(Number(maxPrice)); }
    if (q) { sql += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }

    const [rows] = await pool.query(sql, params);
    let products = rows.map(formatProduct);

    // sizes/colors filtering done in JS since they're JSON arrays
    if (sizes) {
      const wanted = sizes.split(',');
      products = products.filter(p => p.sizes.some(s => wanted.includes(s)));
    }
    if (colors) {
      const wanted = colors.split(',');
      products = products.filter(p => p.colors.some(c => wanted.includes(c.name)));
    }

    switch (sort) {
      case 'price-asc': products.sort((a, b) => a.price - b.price); break;
      case 'price-desc': products.sort((a, b) => b.price - a.price); break;
      case 'newest': products.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)); break;
      case 'name-asc': products.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'rating': products.sort((a, b) => b.rating - a.rating); break;
      default:
        products.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.dateAdded) - new Date(a.dateAdded);
        });
    }

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Product not found.' });
    res.json(formatProduct(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product.' });
  }
});

// POST /api/products  (admin only) — create
router.post('/', requireAdmin, async (req, res) => {
  try {
    const p = req.body;
    const id = p.id || generateId('prod');
    const dateAdded = p.dateAdded || new Date().toISOString().split('T')[0];

    await pool.query(
      `INSERT INTO products
        (id, name, price, original_price, category_id, subcategory_id, sizes, colors, stock, images, description, rating, reviews, date_added, featured, on_sale)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id, p.name, p.price, p.originalPrice ?? p.price, p.category, p.subcategory,
        JSON.stringify(p.sizes || []), JSON.stringify(p.colors || []), p.stock ?? 0,
        JSON.stringify(p.images || []), p.description || '', p.rating || 0, p.reviews || 0,
        dateAdded, !!p.featured, !!p.onSale
      ]
    );
    res.status(201).json({ ...p, id, dateAdded });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

// PUT /api/products/:id  (admin only) — update
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const p = req.body;
    const [existingRows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!existingRows.length) return res.status(404).json({ error: 'Product not found.' });
    const existing = formatProduct(existingRows[0]);
    const merged = { ...existing, ...p };

    await pool.query(
      `UPDATE products SET name=?, price=?, original_price=?, category_id=?, subcategory_id=?,
        sizes=?, colors=?, stock=?, images=?, description=?, rating=?, reviews=?, featured=?, on_sale=?
       WHERE id=?`,
      [
        merged.name, merged.price, merged.originalPrice, merged.category, merged.subcategory,
        JSON.stringify(merged.sizes || []), JSON.stringify(merged.colors || []), merged.stock,
        JSON.stringify(merged.images || []), merged.description, merged.rating, merged.reviews,
        !!merged.featured, !!merged.onSale, req.params.id
      ]
    );
    res.json(merged);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

// DELETE /api/products/:id  (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

module.exports = router;
