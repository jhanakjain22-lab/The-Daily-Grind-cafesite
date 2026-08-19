const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, saveDatabase } = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const db = getDb();
    const exists = db.exec('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length > 0 && exists[0].values.length > 0) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashed]);
    saveDatabase();

    res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const db = getDb();
    const result = db.exec('SELECT * FROM users WHERE email = ?', [email]);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const row = result[0].values[0];
    const cols = result[0].columns;
    const user = {};
    cols.forEach((col, i) => user[col] = row[i]);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ name: user.name, email: user.email, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/profile', auth, (req, res) => {
  try {
    const db = getDb();
    const result = db.exec('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const cols = result[0].columns;
    const row = result[0].values[0];
    const user = {};
    cols.forEach((col, i) => user[col] = row[i]);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/profile', auth, (req, res) => {
  try {
    const { name } = req.body;
    const db = getDb();
    db.run('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);
    saveDatabase();

    const result = db.exec('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
    const cols = result[0].columns;
    const row = result[0].values[0];
    const user = {};
    cols.forEach((col, i) => user[col] = row[i]);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
