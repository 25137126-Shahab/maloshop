// Populates MySQL with the same demo data the site used to seed into localStorage.
// Run once after creating the schema:  npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db/pool');
const SEED = require('./seed-data');
const { generateId } = require('./utils/helpers');

async function seed() {
  const conn = await pool.getConnection();
  try {
    console.log('Seeding categories...');
    for (const cat of SEED.categories) {
      await conn.query(
        'INSERT IGNORE INTO categories (id, name, slug, image) VALUES (?,?,?,?)',
        [cat.id, cat.name, cat.slug, cat.image]
      );
      for (const sub of cat.subcategories || []) {
        await conn.query(
          'INSERT IGNORE INTO subcategories (id, category_id, name, slug) VALUES (?,?,?,?)',
          [sub.id, cat.id, sub.name, sub.slug]
        );
      }
    }

    console.log(`Seeding ${SEED.products.length} products...`);
    for (const p of SEED.products) {
      await conn.query(
        `INSERT IGNORE INTO products
          (id, name, price, original_price, category_id, subcategory_id, sizes, colors, stock, images, description, rating, reviews, date_added, featured, on_sale)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          p.id, p.name, p.price, p.originalPrice, p.category, p.subcategory,
          JSON.stringify(p.sizes), JSON.stringify(p.colors), p.stock, JSON.stringify(p.images),
          p.description, p.rating, p.reviews, p.dateAdded, !!p.featured, !!p.onSale
        ]
      );
    }

    console.log('Seeding admin user...');
    const adminPasswordHash = await bcrypt.hash(SEED.admin.password, 10);
    await conn.query(
      'INSERT IGNORE INTO admin_users (id, username, password_hash, name) VALUES (?,?,?,?)',
      [generateId('admin'), SEED.admin.username, adminPasswordHash, SEED.admin.name]
    );

    console.log('✅ Seeding complete.');
    console.log(`   Admin login → username: ${SEED.admin.username}  password: ${SEED.admin.password}`);
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed();
