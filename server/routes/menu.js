const express = require('express');
const { getDb } = require('../database');

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

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { category } = req.query;
    const categories = parseRows(db.exec('SELECT * FROM categories'));

    let items;
    if (category && category !== 'all') {
      items = parseRows(db.exec('SELECT * FROM menu_items WHERE category_id = ? AND available = 1', [category]));
    } else {
      items = parseRows(db.exec('SELECT * FROM menu_items WHERE available = 1'));
    }

    res.json({ categories, items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/search', (req, res) => {
  try {
    const db = getDb();
    const { q } = req.query;
    const items = parseRows(db.exec(
      'SELECT * FROM menu_items WHERE available = 1 AND (name LIKE ? OR description LIKE ?)',
      [`%${q}%`, `%${q}%`]
    ));
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const result = db.exec('SELECT * FROM menu_items WHERE id = ?', [parseInt(req.params.id)]);
    const rows = parseRows(result);
    if (rows.length === 0) return res.status(404).json({ message: 'Item not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
