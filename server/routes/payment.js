const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { getDb, saveDatabase } = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

function parseRows(result) {
  if (result.length === 0) return [];
  const cols = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    cols.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

router.post('/create-order', auth, async (req, res) => {
  try {
    const { items, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items provided' });
    }

    const amountInPaise = Math.round(total * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });

    const db = getDb();
    db.run('INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)', [req.user.id, total, 'pending']);
    const orderResult = parseRows(db.exec('SELECT last_insert_rowid() as id'));
    const orderId = orderResult[0].id;

    const stmt = db.prepare('INSERT INTO order_items (order_id, name, price, qty) VALUES (?, ?, ?, ?)');
    for (const item of items) {
      stmt.run([orderId, item.name, item.price, item.qty]);
    }
    stmt.free();

    db.run(
      'INSERT INTO payments (order_id, razorpay_order_id, amount, status) VALUES (?, ?, ?, ?)',
      [orderId, razorpayOrder.id, total, 'created']
    );

    const cartResult = parseRows(db.exec('SELECT id FROM cart WHERE user_id = ?', [req.user.id]));
    if (cartResult.length > 0) {
      db.run('DELETE FROM cart_items WHERE cart_id = ?', [cartResult[0].id]);
    }

    saveDatabase();

    res.status(201).json({
      orderId: `ORD-${String(orderId).padStart(6, '0')}`,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/verify', auth, (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Missing payment details' });
    }

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpaySignature;

    const db = getDb();
    const payments = parseRows(
      db.exec('SELECT * FROM payments WHERE razorpay_order_id = ?', [razorpayOrderId])
    );

    if (payments.length === 0) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    const payment = payments[0];

    if (isValid) {
      db.run(
        'UPDATE payments SET razorpay_payment_id = ?, razorpay_signature = ?, status = ? WHERE id = ?',
        [razorpayPaymentId, razorpaySignature, 'captured', payment.id]
      );
      db.run('UPDATE orders SET status = ? WHERE id = ?', ['paid', payment.order_id]);
      saveDatabase();

      const order = parseRows(db.exec('SELECT * FROM orders WHERE id = ?', [payment.order_id]));

      res.json({
        success: true,
        message: 'Payment verified successfully',
        orderId: `ORD-${String(payment.order_id).padStart(6, '0')}`,
        paymentId: razorpayPaymentId,
        total: payment.amount
      });
    } else {
      db.run(
        'UPDATE payments SET razorpay_payment_id = ?, razorpay_signature = ?, status = ? WHERE id = ?',
        [razorpayPaymentId, razorpaySignature, 'failed', payment.id]
      );
      saveDatabase();

      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
