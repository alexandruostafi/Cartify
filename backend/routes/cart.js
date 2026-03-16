const express = require('express');
const router  = express.Router();
const { all, get, run } = require('../db');

function requireAuth(req, res, next) {
  if (!req.session.userId)
    return res.status(401).json({ error: 'Please log in first.' });
  next();
}

// GET cart for current user
router.get('/', requireAuth, (req, res) => {
  const items = all(
    `SELECT c.id, c.quantity, p.id AS product_id, p.name, p.price, p.image_url, p.stock
     FROM cart c
     JOIN products p ON c.product_id = p.id
     WHERE c.user_id = ?`,
    [req.session.userId]
  );
  res.json(items);
});

// POST add/update item in cart
router.post('/', requireAuth, (req, res) => {
  const { product_id, quantity } = req.body;
  if (!product_id || !quantity || quantity < 1)
    return res.status(400).json({ error: 'product_id and quantity >= 1 required.' });

  const product = get('SELECT stock FROM products WHERE id = ?', [product_id]);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  if (product.stock < quantity)
    return res.status(400).json({ error: 'Not enough stock.' });

  run(
    `INSERT INTO cart (user_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = excluded.quantity`,
    [req.session.userId, product_id, quantity]
  );

  res.json({ message: 'Cart updated.' });
});

// DELETE single item from cart
router.delete('/:productId', requireAuth, (req, res) => {
  run('DELETE FROM cart WHERE user_id = ? AND product_id = ?',
    [req.session.userId, req.params.productId]);
  res.json({ message: 'Item removed.' });
});

// DELETE entire cart
router.delete('/', requireAuth, (req, res) => {
  run('DELETE FROM cart WHERE user_id = ?', [req.session.userId]);
  res.json({ message: 'Cart cleared.' });
});

module.exports = router;
