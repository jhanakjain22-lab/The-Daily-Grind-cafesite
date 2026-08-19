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

router.get('/', auth, (req, res) => {
  try {
    const db = getDb();
    const cartResult = db.exec('SELECT * FROM cart WHERE user_id = ?', [req.user.id]);
    const carts = parseRows(cartResult);
    if (carts.length === 0) return res.json([]);

    const items = parseRows(db.exec('SELECT ci.item_id AS id, ci.name, ci.price, ci.image, ci.qty FROM cart_items ci WHERE ci.cart_id = ?', [carts[0].id]));
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, (req, res) => {
  try {
    const db = getDb();
    const { itemId, qty = 1 } = req.body;

    let cartResult = db.exec('SELECT * FROM cart WHERE user_id = ?', [req.user.id]);
    let carts = parseRows(cartResult);

    if (carts.length === 0) {
      db.run('INSERT INTO cart (user_id) VALUES (?)', [req.user.id]);
      cartResult = db.exec('SELECT * FROM cart WHERE user_id = ?', [req.user.id]);
      carts = parseRows(cartResult);
    }

    const cartId = carts[0].id;
    const existing = parseRows(db.exec('SELECT * FROM cart_items WHERE cart_id = ? AND item_id = ?', [cartId, parseInt(itemId)]));

    if (existing.length > 0) {
      db.run('UPDATE cart_items SET qty = qty + ? WHERE id = ?', [qty, existing[0].id]);
    } else {
      const menu = parseRows(db.exec('SELECT * FROM menu_items WHERE id = ?', [parseInt(itemId)]));
      if (menu.length === 0) return res.status(404).json({ message: 'Menu item not found' });
      const m = menu[0];
      db.run('INSERT INTO cart_items (cart_id, item_id, name, price, image, qty) VALUES (?, ?, ?, ?, ?, ?)', [cartId, m.id, m.name, m.price, m.image, qty]);
    }

    saveDatabase();
    const items = parseRows(db.exec('SELECT ci.item_id AS id, ci.name, ci.price, ci.image, ci.qty FROM cart_items ci WHERE ci.cart_id = ?', [cartId]));
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:itemId', auth, (req, res) => {
  try {
    const db = getDb();
    const { qty } = req.body;

    const cartResult = db.exec('SELECT * FROM cart WHERE user_id = ?', [req.user.id]);
    const carts = parseRows(cartResult);
    if (carts.length === 0) return res.status(404).json({ message: 'Cart not found' });

    const cartId = carts[0].id;
    if (qty <= 0) {
      db.run('DELETE FROM cart_items WHERE cart_id = ? AND item_id = ?', [cartId, parseInt(req.params.itemId)]);
    } else {
      db.run('UPDATE cart_items SET qty = ? WHERE cart_id = ? AND item_id = ?', [qty, cartId, parseInt(req.params.itemId)]);
    }

    saveDatabase();
    const items = parseRows(db.exec('SELECT ci.item_id AS id, ci.name, ci.price, ci.image, ci.qty FROM cart_items ci WHERE ci.cart_id = ?', [cartId]));
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:itemId', auth, (req, res) => {
  try {
    const db = getDb();
    const cartResult = db.exec('SELECT * FROM cart WHERE user_id = ?', [req.user.id]);
    const carts = parseRows(cartResult);
    if (carts.length === 0) return res.status(404).json({ message: 'Cart not found' });

    db.run('DELETE FROM cart_items WHERE cart_id = ? AND item_id = ?', [carts[0].id, parseInt(req.params.itemId)]);
    saveDatabase();

    const items = parseRows(db.exec('SELECT ci.item_id AS id, ci.name, ci.price, ci.image, ci.qty FROM cart_items ci WHERE ci.cart_id = ?', [carts[0].id]));
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/', auth, (req, res) => {
  try {
    const db = getDb();
    const cartResult = db.exec('SELECT * FROM cart WHERE user_id = ?', [req.user.id]);
    const carts = parseRows(cartResult);
    if (carts.length > 0) {
      db.run('DELETE FROM cart_items WHERE cart_id = ?', [carts[0].id]);
      saveDatabase();
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
