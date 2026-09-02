const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verifies a customer JWT (sent as: Authorization: Bearer <token>)
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Login required.' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, name }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

// Like requireAuth, but doesn't fail if no token — used for guest checkout
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      req.user = null;
    }
  }
  next();
}

// Verifies an admin JWT
function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Admin login required.' });

  try {
    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    req.admin = payload; // { id, username, name }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired admin session.' });
  }
}

module.exports = { requireAuth, optionalAuth, requireAdmin };
