const express = require('express');
const router  = express.Router();
const { all, get, run, _run, transaction } = require('../db');

function requireAuth(req, res, next) {
  if (!req.session.userId)
    return res.status(401).json({ error: 'Please log in first.' });
  next();
}

function requireAdmin(req, res, next) {
  if (req.session.role !== 'admin')
    return res.status(403).json({ error: 'Admin access required.' });
  next();
}

// POST place order (checkout)
router.post('/', requireAuth, (req, res) => {
  const { full_name, address, city, postal_code, country } = req.body;
  if (!full_name || !address || !city || !postal_code || !country)
    return res.status(400).json({ error: 'All shipping fields are required.' });

  const cartItems = all(
    `SELECT c.quantity, p.id AS product_id, p.price, p.stock, p.name
     FROM cart c
     JOIN products p ON c.product_id = p.id
     WHERE c.user_id = ?`,
    [req.session.userId]
  );

  if (cartItems.length === 0)
    return res.status(400).json({ error: 'Cart is empty.' });

  for (const item of cartItems) {
    if (item.stock < item.quantity)
      return res.status(400).json({ error: `Not enough stock for "${item.name}".` });
  }

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const placeOrder = transaction(() => {
    const order = _run(
      'INSERT INTO orders (user_id, total, full_name, address, city, postal_code, country) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.session.userId, total, full_name, address, city, postal_code, country]
    );
    const orderId = order.lastInsertRowid;

    for (const item of cartItems) {
      _run(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
      _run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    _run('DELETE FROM cart WHERE user_id = ?', [req.session.userId]);
    return orderId;
  });

  const orderId = placeOrder();
  res.status(201).json({ message: 'Order placed successfully.', orderId });
});

// GET orders for current user
router.get('/my', requireAuth, (req, res) => {
  const orders = all(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [req.session.userId]
  );

  const result = orders.map(order => {
    const items = all(
      `SELECT oi.*, p.name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [order.id]
    );
    return { ...order, items };
  });

  res.json(result);
});

// GET all orders (admin)
router.get('/', requireAdmin, (req, res) => {
  const orders = all(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email
     FROM orders o
     JOIN users u ON o.user_id = u.id
     ORDER BY o.created_at DESC`
  );

  const result = orders.map(order => {
    const items = all(
      `SELECT oi.*, p.name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [order.id]
    );
    return { ...order, items };
  });

  res.json(result);
});

// PATCH update order status (admin)
router.patch('/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!valid.includes(status))
    return res.status(400).json({ error: 'Invalid status.' });

  const existing = get('SELECT id FROM orders WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Order not found.' });

  run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ message: 'Order status updated.' });
});

module.exports = router;
