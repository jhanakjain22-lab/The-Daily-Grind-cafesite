const mongoose = require('mongoose');
require('dotenv').config();

const { Category, MenuItem } = require('../models/MenuItem');

const categories = [
  { id: 'coffee', name: 'Coffee' },
  { id: 'tea', name: 'Tea' },
  { id: 'smoothies', name: 'Smoothies' },
  { id: 'pastries', name: 'Pastries' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'sandwiches', name: 'Sandwiches' }
];

const menuItems = [
  { name: 'Espresso', description: 'Rich and bold single shot', price: 3.50, categoryId: 'coffee', image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop' },
  { name: 'Cappuccino', description: 'Espresso with steamed milk foam', price: 4.50, categoryId: 'coffee', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop' },
  { name: 'Vanilla Latte', description: 'Smooth latte with Madagascar vanilla', price: 5.00, categoryId: 'coffee', badge: 'Popular', image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&h=300&fit=crop' },
  { name: 'Cold Brew', description: 'Slow-steeped for 18 hours', price: 4.50, categoryId: 'coffee', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop' },
  { name: 'Caramel Macchiato', description: 'Layered espresso with caramel drizzle', price: 5.50, categoryId: 'coffee', image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=300&fit=crop' },
  { name: 'Mocha', description: 'Espresso with chocolate and steamed milk', price: 5.00, categoryId: 'coffee', image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&h=300&fit=crop' },
  { name: 'Flat White', description: 'Velvety microfoam over double ristretto', price: 5.00, categoryId: 'coffee', image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=400&h=300&fit=crop' },
  { name: 'Affogato', description: 'Espresso poured over vanilla gelato', price: 5.50, categoryId: 'coffee', badge: 'New', image: 'https://images.unsplash.com/photo-1521302200778-33500795e128?w=400&h=300&fit=crop' },
  { name: 'Honey Oat Latte', description: 'Oat milk latte sweetened with raw honey', price: 5.50, categoryId: 'coffee', image: 'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=400&h=300&fit=crop' },
  { name: 'Iced Americano', description: 'Double shot espresso over ice, bold & clean', price: 4.00, categoryId: 'coffee', image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=300&fit=crop' },
  { name: 'Green Tea', description: 'Sencha Japanese green tea', price: 3.50, categoryId: 'tea', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop' },
  { name: 'Chai Latte', description: 'Spiced chai with frothy milk', price: 4.50, categoryId: 'tea', badge: 'Popular', image: 'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?w=400&h=300&fit=crop' },
  { name: 'Earl Grey', description: 'Classic bergamot-infused black tea', price: 3.50, categoryId: 'tea', image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400&h=300&fit=crop' },
  { name: 'Matcha Latte', description: 'Ceremonial grade matcha with oat milk', price: 5.50, categoryId: 'tea', image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=300&fit=crop' },
  { name: 'London Fog', description: 'Earl grey, vanilla, steamed milk', price: 5.00, categoryId: 'tea', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop' },
  { name: 'Peppermint Tea', description: 'Fresh mint leaves, naturally soothing', price: 3.50, categoryId: 'tea', image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop' },
  { name: 'Jasmine Oolong', description: 'Floral jasmine pearl oolong', price: 4.00, categoryId: 'tea', badge: 'New', image: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=400&h=300&fit=crop' },
  { name: 'Berry Blast', description: 'Strawberry, blueberry, banana, yogurt', price: 6.50, categoryId: 'smoothies', badge: 'Popular', image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop' },
  { name: 'Mango Tropical', description: 'Mango, pineapple, coconut milk', price: 6.50, categoryId: 'smoothies', image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop' },
  { name: 'Green Power', description: 'Spinach, banana, apple, ginger', price: 7.00, categoryId: 'smoothies', image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop' },
  { name: 'Peanut Butter Cup', description: 'Banana, peanut butter, cocoa, oat milk', price: 7.00, categoryId: 'smoothies', image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=300&fit=crop' },
  { name: 'Peach Sunrise', description: 'Peach, mango, orange juice, chia seeds', price: 6.50, categoryId: 'smoothies', badge: 'New', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop' },
  { name: 'Croissant', description: 'Buttery, flaky, golden', price: 3.50, categoryId: 'pastries', badge: 'Fresh', image: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400&h=300&fit=crop' },
  { name: 'Blueberry Muffin', description: 'Loaded with wild blueberries', price: 4.00, categoryId: 'pastries', image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop' },
  { name: 'Cinnamon Roll', description: 'Warm with cream cheese glaze', price: 4.50, categoryId: 'pastries', badge: 'Fresh', image: 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400&h=300&fit=crop' },
  { name: 'Chocolate Brownie', description: 'Dark chocolate, fudgy center', price: 4.00, categoryId: 'pastries', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop' },
  { name: 'Almond Biscotti', description: 'Crunchy almond biscuit, perfect for dipping', price: 3.00, categoryId: 'pastries', image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&h=300&fit=crop' },
  { name: 'Banana Bread', description: 'Moist banana bread with walnut chunks', price: 4.00, categoryId: 'pastries', image: 'https://images.unsplash.com/photo-1604882737321-e1c2e0e3b284?w=400&h=300&fit=crop' },
  { name: 'Scone', description: 'Classic buttermilk scone with jam', price: 3.50, categoryId: 'pastries', image: 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400&h=300&fit=crop' },
  { name: 'Pain au Chocolat', description: 'Flaky pastry with dark chocolate filling', price: 4.00, categoryId: 'pastries', badge: 'Fresh', image: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400&h=300&fit=crop' },
  { name: 'Tiramisu', description: 'Classic Italian coffee-flavored layered dessert', price: 7.00, categoryId: 'desserts', badge: 'Popular', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop' },
  { name: 'Cheesecake', description: 'New York style with berry compote', price: 6.50, categoryId: 'desserts', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop' },
  { name: 'Creme Brulee', description: 'Vanilla custard with caramelized sugar crust', price: 7.50, categoryId: 'desserts', image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=300&fit=crop' },
  { name: 'Chocolate Lava Cake', description: 'Warm molten center, served with cream', price: 8.00, categoryId: 'desserts', badge: 'New', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop' },
  { name: 'Panna Cotta', description: 'Silky vanilla custard with caramel drizzle', price: 6.50, categoryId: 'desserts', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop' },
  { name: 'Avocado Toast', description: 'Sourdough, smashed avo, chili flakes', price: 8.50, categoryId: 'sandwiches', badge: 'Popular', image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop' },
  { name: 'Caprese Panini', description: 'Mozzarella, tomato, basil, balsamic', price: 9.00, categoryId: 'sandwiches', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop' },
  { name: 'Turkey Club', description: 'Roasted turkey, bacon, lettuce, tomato', price: 9.50, categoryId: 'sandwiches', image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&h=300&fit=crop' },
  { name: 'Veggie Wrap', description: 'Hummus, grilled veggies, mixed greens', price: 8.50, categoryId: 'sandwiches', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop' },
  { name: 'Chicken Pesto', description: 'Grilled chicken, pesto, mozzarella, ciabatta', price: 10.00, categoryId: 'sandwiches', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop' },
  { name: 'BLT Classic', description: 'Bacon, lettuce, tomato on sourdough', price: 8.50, categoryId: 'sandwiches', image: 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=400&h=300&fit=crop' },
  { name: 'Grilled Cheese', description: 'Three cheese blend on buttery sourdough', price: 7.50, categoryId: 'sandwiches', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop' }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Category.deleteMany();
    await MenuItem.deleteMany();
    console.log('Cleared existing data');

    await Category.insertMany(categories);
    console.log(`Seeded ${categories.length} categories`);

    await MenuItem.insertMany(menuItems);
    console.log(`Seeded ${menuItems.length} menu items`);

    console.log('Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
