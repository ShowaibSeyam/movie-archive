const jwt = require('jsonwebtoken');
const db  = require('../config/db');
const SECRET = process.env.JWT_SECRET || 'fallback_secret';

/* Require valid JWT */
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const token  = (header && header.startsWith('Bearer ') ? header.slice(7) : null)
                || req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'No token – access denied.' });

    const decoded = jwt.verify(token, SECRET);
    const [[user]] = await db.query(
      'SELECT user_id,user_name,email,role,avatar_url FROM user WHERE user_id=?',
      [decoded.user_id]
    );
    if (!user) return res.status(401).json({ error: 'User not found.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

/* Attach user if token present, continue either way */
const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const token  = (header && header.startsWith('Bearer ') ? header.slice(7) : null)
                || req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, SECRET);
      const [[user]] = await db.query(
        'SELECT user_id,user_name,email,role FROM user WHERE user_id=?',
        [decoded.user_id]
      );
      if (user) req.user = user;
    }
  } catch { /* ignore */ }
  next();
};

/* Admin only */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin')
    return res.status(403).json({ error: 'Admin access required.' });
  next();
};

module.exports = { authenticate, optionalAuth, requireAdmin };
