const express = require('express');
const { getDb, saveDatabase } = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();

function parseRows(result) {
  if (result.length === 0) return [];
  const cols = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    cols.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

router.post('/checkout', auth, (req, res) => {
  try {
    const db = getDb();
    const { items, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in cart' });
    }

    db.run('INSERT INTO orders (user_id, total) VALUES (?, ?)', [req.user.id, total]);
    const orderResult = parseRows(db.exec('SELECT last_insert_rowid() as id'));
    const orderId = orderResult[0].id;

    const stmt = db.prepare('INSERT INTO order_items (order_id, name, price, qty) VALUES (?, ?, ?, ?)');
    for (const item of items) {
      stmt.run([orderId, item.name, item.price, item.qty]);
    }
    stmt.free();

    const cartResult = parseRows(db.exec('SELECT id FROM cart WHERE user_id = ?', [req.user.id]));
    if (cartResult.length > 0) {
      db.run('DELETE FROM cart_items WHERE cart_id = ?', [cartResult[0].id]);
    }

    saveDatabase();
    res.status(201).json({
      message: 'Order placed successfully!',
      orderId: `ORD-${String(orderId).padStart(6, '0')}`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', auth, (req, res) => {
  try {
    const db = getDb();
    const orders = parseRows(db.exec('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]));
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', auth, (req, res) => {
  try {
    const db = getDb();
    const orders = parseRows(db.exec('SELECT * FROM orders WHERE id = ? AND user_id = ?', [parseInt(req.params.id), req.user.id]));
    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });

    const items = parseRows(db.exec('SELECT * FROM order_items WHERE order_id = ?', [orders[0].id]));
    res.json({ ...orders[0], items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
