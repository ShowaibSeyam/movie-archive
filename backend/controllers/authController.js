const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');
const { validationResult } = require('express-validator');

const SECRET  = process.env.JWT_SECRET     || 'fallback_secret';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

const sign = (user) =>
  jwt.sign({ user_id: user.user_id, role: user.role }, SECRET, { expiresIn: EXPIRES });

/* POST /api/auth/register */
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { user_name, email, password } = req.body;
  try {
    const [exist] = await db.query('SELECT user_id FROM user WHERE email=?', [email.toLowerCase()]);
    if (exist.length) return res.status(409).json({ error: 'Email already registered.' });

    const hash = await bcrypt.hash(password, 12);
    const [r]  = await db.query(
      'INSERT INTO user (user_name,email,password) VALUES (?,?,?)',
      [user_name.trim(), email.toLowerCase().trim(), hash]
    );
    const user  = { user_id: r.insertId, user_name, email, role: 'user' };
    res.status(201).json({ message: 'Registration successful.', token: sign(user), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

/* POST /api/auth/login */
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const [[user]] = await db.query('SELECT * FROM user WHERE email=?', [email.toLowerCase().trim()]);
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)  return res.status(401).json({ error: 'Invalid email or password.' });

    const { password: _, ...safe } = user;
    res.json({ message: 'Login successful.', token: sign(user), user: safe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

/* GET /api/auth/me */
exports.getMe = (req, res) => {
  const { password: _, ...safe } = req.user;
  res.json({ user: safe });
};

/* PUT /api/auth/profile */
exports.updateProfile = async (req, res) => {
  const { user_name, avatar_url } = req.body;
  try {
    await db.query(
      'UPDATE user SET user_name=?,avatar_url=? WHERE user_id=?',
      [user_name || req.user.user_name, avatar_url || null, req.user.user_id]
    );
    res.json({ message: 'Profile updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

/* PUT /api/auth/password */
exports.changePassword = async (req, res) => {
  const { current_password, new_password } = req.body;
  try {
    const [[row]] = await db.query('SELECT password FROM user WHERE user_id=?', [req.user.user_id]);
    const ok = await bcrypt.compare(current_password, row.password);
    if (!ok) return res.status(400).json({ error: 'Current password is incorrect.' });

    const hash = await bcrypt.hash(new_password, 12);
    await db.query('UPDATE user SET password=? WHERE user_id=?', [hash, req.user.user_id]);
    res.json({ message: 'Password changed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password.' });
  }
};
