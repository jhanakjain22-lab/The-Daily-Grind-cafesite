const express = require('express');
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');

const router = express.Router();

// Get cart
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = { items: [] };
    res.json(cart.items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add item to cart
router.post('/', auth, async (req, res) => {
  try {
    const { itemId, qty = 1 } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existing = cart.items.find(i => i.itemId.toString() === itemId);
    if (existing) {
      existing.qty += qty;
    } else {
      const MenuItem = require('../models/MenuItem').MenuItem;
      const menu = await MenuItem.findById(itemId);
      if (!menu) return res.status(404).json({ message: 'Menu item not found' });
      cart.items.push({ itemId: menu._id, name: menu.name, price: menu.price, image: menu.image, qty });
    }

    await cart.save();
    res.json(cart.items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update quantity
router.put('/:itemId', auth, async (req, res) => {
  try {
    const { qty } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    if (qty <= 0) {
      cart.items = cart.items.filter(i => i.itemId.toString() !== req.params.itemId);
    } else {
      const item = cart.items.find(i => i.itemId.toString() === req.params.itemId);
      if (item) item.qty = qty;
    }

    await cart.save();
    res.json(cart.items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove item
router.delete('/:itemId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(i => i.itemId.toString() !== req.params.itemId);
    await cart.save();
    res.json(cart.items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Clear cart
router.delete('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
