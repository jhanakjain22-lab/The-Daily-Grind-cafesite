const express = require('express');
const { Category, MenuItem } = require('../models/MenuItem');

const router = express.Router();

// Get all menu (categories + items)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const categories = await Category.find();
    let items = await MenuItem.find({ available: true });

    if (category && category !== 'all') {
      items = items.filter(i => i.categoryId === category);
    }

    res.json({ categories, items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search menu
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const items = await MenuItem.find({
      available: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
