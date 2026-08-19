const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');

const router = express.Router();

// Checkout
router.post('/checkout', auth, async (req, res) => {
  try {
    const { items, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in cart' });
    }

    const order = await Order.create({
      user: req.user.id,
      items: items.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
      total
    });

    // Clear cart after order
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(201).json({ message: 'Order placed successfully!', orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders for user
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
