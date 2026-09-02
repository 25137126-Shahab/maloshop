const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireAdmin } = require('../middleware/auth');
const { generateId } = require('../utils/helpers');

async function getFullCategories() {
  const [cats] = await pool.query('SELECT * FROM categories');
  const [subs] = await pool.query('SELECT * FROM subcategories');
  return cats.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image,
    subcategories: subs.filter(s => s.category_id === c.id).map(s => ({ id: s.id, name: s.name, slug: s.slug }))
  }));
}

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    res.json(await getFullCategories());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// GET /api/categories/:idOrSlug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const all = await getFullCategories();
    const cat = all.find(c => c.id === req.params.idOrSlug || c.slug === req.params.idOrSlug);
    if (!cat) return res.status(404).json({ error: 'Category not found.' });
    res.json(cat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch category.' });
  }
});

// POST /api/categories  (admin only)
// body: { name, slug, image, subcategories: [{ name, slug }] }
router.post('/', requireAdmin, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { name, slug, image, subcategories = [] } = req.body;
    const id = generateId('cat');
    await conn.beginTransaction();
    await conn.query('INSERT INTO categories (id, name, slug, image) VALUES (?,?,?,?)', [id, name, slug, image || null]);
    for (const s of subcategories) {
      await conn.query('INSERT INTO subcategories (id, category_id, name, slug) VALUES (?,?,?,?)', [
        generateId('sub'), id, s.name, s.slug
      ]);
    }
    await conn.commit();
    res.status(201).json({ id, name, slug, image, subcategories });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to create category.' });
  } finally {
    conn.release();
  }
});

// PUT /api/categories/:id  (admin only) — replaces name/image and subcategory list
router.put('/:id', requireAdmin, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { name, slug, image, subcategories } = req.body;
    await conn.beginTransaction();
    await conn.query('UPDATE categories SET name=COALESCE(?,name), slug=COALESCE(?,slug), image=COALESCE(?,image) WHERE id=?', [
      name, slug, image, req.params.id
    ]);
    if (Array.isArray(subcategories)) {
      await conn.query('DELETE FROM subcategories WHERE category_id = ?', [req.params.id]);
      for (const s of subcategories) {
        await conn.query('INSERT INTO subcategories (id, category_id, name, slug) VALUES (?,?,?,?)', [
          s.id || generateId('sub'), req.params.id, s.name, s.slug
        ]);
      }
    }
    await conn.commit();
    const all = await getFullCategories();
    res.json(all.find(c => c.id === req.params.id));
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to update category.' });
  } finally {
    conn.release();
  }
});

// DELETE /api/categories/:id  (admin only) — blocked if products still use it
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [req.params.id]);
    if (count > 0) {
      return res.status(400).json({ error: 'Reassign or delete products in this category before deleting it.' });
    }
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete category.' });
  }
});

module.exports = router;
