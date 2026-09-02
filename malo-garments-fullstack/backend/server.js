require('dotenv').config();
const express = require('express');
const cors = require('cors');

const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const ordersRoutes = require('./routes/orders');
const newsletterRoutes = require('./routes/newsletter');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/newsletter', newsletterRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not found.' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Malo Garments backend running on http://localhost:${PORT}`);
});
