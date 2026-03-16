const express = require('express');
const router  = express.Router();
const { all, get, run } = require('../db');

// GET all products (with optional search & category filter)
router.get('/', (req, res) => {
  const { search, category } = req.query;
  let query = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    query += ' AND c.name = ?';
    params.push(category);
  }
  query += ' ORDER BY p.id DESC';

  const products = all(query, params);
  res.json(products);
});

// GET single product
router.get('/:id', (req, res) => {
  const product = get(`
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?`, [req.params.id]);

  if (!product) return res.status(404).json({ error: 'Product not found.' });
  res.json(product);
});

// GET all categories
router.get('/meta/categories', (req, res) => {
  const categories = all('SELECT * FROM categories ORDER BY name');
  res.json(categories);
});

// --- Admin only below ---
function requireAdmin(req, res, next) {
  if (req.session.role !== 'admin')
    return res.status(403).json({ error: 'Admin access required.' });
  next();
}

// POST create product
router.post('/', requireAdmin, (req, res) => {
  const { name, description, price, stock, image_url, category_id } = req.body;
  if (!name || price == null)
    return res.status(400).json({ error: 'Name and price are required.' });

  const result = run(
    'INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description || '', price, stock || 0, image_url || '', category_id || null]
  );

  res.status(201).json({ id: result.lastInsertRowid, message: 'Product created.' });
});

// PUT update product
router.put('/:id', requireAdmin, (req, res) => {
  const { name, description, price, stock, image_url, category_id } = req.body;
  const existing = get('SELECT id FROM products WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Product not found.' });

  run(
    'UPDATE products SET name=?, description=?, price=?, stock=?, image_url=?, category_id=? WHERE id=?',
    [name, description, price, stock, image_url, category_id, req.params.id]
  );

  res.json({ message: 'Product updated.' });
});

// DELETE product
router.delete('/:id', requireAdmin, (req, res) => {
  const existing = get('SELECT id FROM products WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Product not found.' });

  run('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ message: 'Product deleted.' });
});

module.exports = router;
