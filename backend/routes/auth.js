const express = require('express');
const bcrypt  = require('bcrypt');
const router  = express.Router();
const db      = require('../db');

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields are required.' });

  const existing = db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (existing)
    return res.status(409).json({ error: 'Email already registered.' });

  const hashed = await bcrypt.hash(password, 10);
  const result = db.run(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashed]
  );

  req.session.userId = result.lastInsertRowid;
  req.session.role   = 'customer';
  req.session.name   = name;
  res.json({ message: 'Registered successfully.', name, role: 'customer' });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  const user = db.get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user)
    return res.status(401).json({ error: 'Invalid credentials.' });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(401).json({ error: 'Invalid credentials.' });

  req.session.userId = user.id;
  req.session.role   = user.role;
  req.session.name   = user.name;
  res.json({ message: 'Logged in.', name: user.name, role: user.role });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out.' }));
});

// Get current session user
router.get('/me', (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: 'Not authenticated.' });
  res.json({ id: req.session.userId, name: req.session.name, role: req.session.role });
});

module.exports = router;
