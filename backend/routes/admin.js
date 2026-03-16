const express = require('express');
const router  = express.Router();
const { all, get, run } = require('../db');

function requireAdmin(req, res, next) {
  if (req.session.role !== 'admin')
    return res.status(403).json({ error: 'Admin access required.' });
  next();
}

// GET dashboard stats
router.get('/stats', requireAdmin, (req, res) => {
  const totalProducts  = get('SELECT COUNT(*) AS count FROM products').count;
  const totalOrders    = get('SELECT COUNT(*) AS count FROM orders').count;
  const totalCustomers = get("SELECT COUNT(*) AS count FROM users WHERE role='customer'").count;
  const totalRevenue   = get("SELECT COALESCE(SUM(total),0) AS sum FROM orders WHERE status != 'cancelled'").sum;
  const recentOrders   = all(
    `SELECT o.id, o.total, o.status, o.created_at, u.name AS customer_name
     FROM orders o JOIN users u ON o.user_id = u.id
     ORDER BY o.created_at DESC LIMIT 5`
  );
  res.json({ totalProducts, totalOrders, totalCustomers, totalRevenue, recentOrders });
});

// GET all users (admin)
router.get('/users', requireAdmin, (req, res) => {
  res.json(all("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"));
});

// PATCH promote/demote user role
router.patch('/users/:id/role', requireAdmin, (req, res) => {
  const { role } = req.body;
  if (!['admin', 'customer'].includes(role))
    return res.status(400).json({ error: 'Invalid role.' });

  const user = get('SELECT id FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
  res.json({ message: 'User role updated.' });
});

// GET all categories
router.get('/categories', requireAdmin, (req, res) => {
  res.json(all('SELECT * FROM categories ORDER BY name'));
});

// POST create category
router.post('/categories', requireAdmin, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name required.' });
  const result = run('INSERT INTO categories (name) VALUES (?)', [name]);
  res.status(201).json({ id: result.lastInsertRowid, name });
});

// DELETE category
router.delete('/categories/:id', requireAdmin, (req, res) => {
  run('DELETE FROM categories WHERE id = ?', [req.params.id]);
  res.json({ message: 'Category deleted.' });
});

module.exports = router;
