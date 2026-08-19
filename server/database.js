const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'cafe.db');

let db;

async function initDatabase() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  createTables();

  if (!fs.existsSync(DB_PATH)) {
    seedData();
  }

  saveDatabase();

  return db;
}

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      category_id TEXT NOT NULL,
      image TEXT NOT NULL,
      badge TEXT,
      available INTEGER DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cart_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT,
      qty INTEGER DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      qty INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      razorpay_order_id TEXT NOT NULL,
      razorpay_payment_id TEXT,
      razorpay_signature TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      status TEXT DEFAULT 'created',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function seedData() {
  const cats = [
    ['coffee', 'Coffee'], ['tea', 'Tea'], ['smoothies', 'Smoothies'],
    ['pastries', 'Pastries'], ['desserts', 'Desserts'], ['sandwiches', 'Sandwiches']
  ];

  for (const [id, name] of cats) {
    db.run('INSERT INTO categories (id, name) VALUES (?, ?)', [id, name]);
  }

  const items = [
    ['Espresso', 'Rich and bold single shot', 3.50, 'coffee', 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop', null],
    ['Cappuccino', 'Espresso with steamed milk foam', 4.50, 'coffee', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop', null],
    ['Vanilla Latte', 'Smooth latte with Madagascar vanilla', 5.00, 'coffee', 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&h=300&fit=crop', 'Popular'],
    ['Cold Brew', 'Slow-steeped for 18 hours', 4.50, 'coffee', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop', null],
    ['Caramel Macchiato', 'Layered espresso with caramel drizzle', 5.50, 'coffee', 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=300&fit=crop', null],
    ['Mocha', 'Espresso with chocolate and steamed milk', 5.00, 'coffee', 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&h=300&fit=crop', null],
    ['Flat White', 'Velvety microfoam over double ristretto', 5.00, 'coffee', 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=400&h=300&fit=crop', null],
    ['Affogato', 'Espresso poured over vanilla gelato', 5.50, 'coffee', 'https://images.unsplash.com/photo-1521302200778-33500795e128?w=400&h=300&fit=crop', 'New'],
    ['Honey Oat Latte', 'Oat milk latte sweetened with raw honey', 5.50, 'coffee', 'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=400&h=300&fit=crop', null],
    ['Iced Americano', 'Double shot espresso over ice, bold & clean', 4.00, 'coffee', 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=300&fit=crop', null],
    ['Green Tea', 'Sencha Japanese green tea', 3.50, 'tea', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop', null],
    ['Chai Latte', 'Spiced chai with frothy milk', 4.50, 'tea', 'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?w=400&h=300&fit=crop', 'Popular'],
    ['Earl Grey', 'Classic bergamot-infused black tea', 3.50, 'tea', 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400&h=300&fit=crop', null],
    ['Matcha Latte', 'Ceremonial grade matcha with oat milk', 5.50, 'tea', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=300&fit=crop', null],
    ['London Fog', 'Earl grey, vanilla, steamed milk', 5.00, 'tea', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop', null],
    ['Peppermint Tea', 'Fresh mint leaves, naturally soothing', 3.50, 'tea', 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop', null],
    ['Jasmine Oolong', 'Floral jasmine pearl oolong', 4.00, 'tea', 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=400&h=300&fit=crop', 'New'],
    ['Berry Blast', 'Strawberry, blueberry, banana, yogurt', 6.50, 'smoothies', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop', 'Popular'],
    ['Mango Tropical', 'Mango, pineapple, coconut milk', 6.50, 'smoothies', 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop', null],
    ['Green Power', 'Spinach, banana, apple, ginger', 7.00, 'smoothies', 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop', null],
    ['Peanut Butter Cup', 'Banana, peanut butter, cocoa, oat milk', 7.00, 'smoothies', 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=300&fit=crop', null],
    ['Peach Sunrise', 'Peach, mango, orange juice, chia seeds', 6.50, 'smoothies', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop', 'New'],
    ['Croissant', 'Buttery, flaky, golden', 3.50, 'pastries', 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400&h=300&fit=crop', 'Fresh'],
    ['Blueberry Muffin', 'Loaded with wild blueberries', 4.00, 'pastries', 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop', null],
    ['Cinnamon Roll', 'Warm with cream cheese glaze', 4.50, 'pastries', 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400&h=300&fit=crop', 'Fresh'],
    ['Chocolate Brownie', 'Dark chocolate, fudgy center', 4.00, 'pastries', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop', null],
    ['Almond Biscotti', 'Crunchy almond biscuit, perfect for dipping', 3.00, 'pastries', 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&h=300&fit=crop', null],
    ['Scone', 'Classic buttermilk scone with jam', 3.50, 'pastries', 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400&h=300&fit=crop', null],
    ['Pain au Chocolat', 'Flaky pastry with dark chocolate filling', 4.00, 'pastries', 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400&h=300&fit=crop', 'Fresh'],
    ['Tiramisu', 'Classic Italian coffee-flavored layered dessert', 7.00, 'desserts', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', 'Popular'],
    ['Cheesecake', 'New York style with berry compote', 6.50, 'desserts', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop', null],
    ['Creme Brulee', 'Vanilla custard with caramelized sugar crust', 7.50, 'desserts', 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=300&fit=crop', null],
    ['Chocolate Lava Cake', 'Warm molten center, served with cream', 8.00, 'desserts', 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop', 'New'],
    ['Panna Cotta', 'Silky vanilla custard with caramel drizzle', 6.50, 'desserts', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop', null],
    ['Avocado Toast', 'Sourdough, smashed avo, chili flakes', 8.50, 'sandwiches', 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop', 'Popular'],
    ['Caprese Panini', 'Mozzarella, tomato, basil, balsamic', 9.00, 'sandwiches', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop', null],
    ['Turkey Club', 'Roasted turkey, bacon, lettuce, tomato', 9.50, 'sandwiches', 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&h=300&fit=crop', null],
    ['Veggie Wrap', 'Hummus, grilled veggies, mixed greens', 8.50, 'sandwiches', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop', null],
    ['Chicken Pesto', 'Grilled chicken, pesto, mozzarella, ciabatta', 10.00, 'sandwiches', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop', null],
    ['BLT Classic', 'Bacon, lettuce, tomato on sourdough', 8.50, 'sandwiches', 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=400&h=300&fit=crop', null],
    ['Grilled Cheese', 'Three cheese blend on buttery sourdough', 7.50, 'sandwiches', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop', null]
  ];

  const stmt = db.prepare('INSERT INTO menu_items (name, description, price, category_id, image, badge) VALUES (?, ?, ?, ?, ?, ?)');
  for (const item of items) {
    stmt.run(item);
  }
  stmt.free();

  console.log(`Seeded ${cats.length} categories and ${items.length} menu items`);
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function getDb() {
  return db;
}

module.exports = { initDatabase, getDb, saveDatabase };
