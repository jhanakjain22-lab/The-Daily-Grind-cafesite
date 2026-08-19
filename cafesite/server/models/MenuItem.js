const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true }
});

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  categoryId: { type: String, required: true },
  image: { type: String, required: true },
  badge: { type: String },
  available: { type: Boolean, default: true }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = { Category, MenuItem };
