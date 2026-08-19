// ===== AXIOS INSTANCE =====
const API = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use((config) => {
  const session = JSON.parse(localStorage.getItem('cafe_session') || 'null');
  if (session?.token) config.headers.Authorization = `Bearer ${session.token}`;
  return config;
}, (error) => Promise.reject(error));

API.interceptors.response.use((res) => res.data, (err) => {
  const message = err.response?.data?.message || err.message || 'Something went wrong';
  return Promise.reject({ message, status: err.response?.status });
});

// ===== MENU DATA (fallback) =====
const FALLBACK_MENU = [
  { id: 1, name: 'Espresso', description: 'Rich and bold single shot', price: 3.50, categoryId: 'coffee', image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop' },
  { id: 2, name: 'Cappuccino', description: 'Espresso with steamed milk foam', price: 4.50, categoryId: 'coffee', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop' },
  { id: 3, name: 'Vanilla Latte', description: 'Smooth latte with Madagascar vanilla', price: 5.00, categoryId: 'coffee', badge: 'Popular', image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&h=300&fit=crop' },
  { id: 4, name: 'Cold Brew', description: 'Slow-steeped for 18 hours', price: 4.50, categoryId: 'coffee', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop' },
  { id: 5, name: 'Caramel Macchiato', description: 'Layered espresso with caramel drizzle', price: 5.50, categoryId: 'coffee', image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=300&fit=crop' },
  { id: 6, name: 'Mocha', description: 'Espresso with chocolate and steamed milk', price: 5.00, categoryId: 'coffee', image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&h=300&fit=crop' },
  { id: 7, name: 'Flat White', description: 'Velvety microfoam over double ristretto', price: 5.00, categoryId: 'coffee', image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=400&h=300&fit=crop' },
  { id: 8, name: 'Affogato', description: 'Espresso poured over vanilla gelato', price: 5.50, categoryId: 'coffee', badge: 'New', image: 'https://images.unsplash.com/photo-1521302200778-33500795e128?w=400&h=300&fit=crop' },
  { id: 9, name: 'Honey Oat Latte', description: 'Oat milk latte sweetened with raw honey', price: 5.50, categoryId: 'coffee', image: 'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=400&h=300&fit=crop' },
  { id: 10, name: 'Iced Americano', description: 'Double shot espresso over ice, bold & clean', price: 4.00, categoryId: 'coffee', image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=300&fit=crop' },
  { id: 11, name: 'Green Tea', description: 'Sencha Japanese green tea', price: 3.50, categoryId: 'tea', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop' },
  { id: 12, name: 'Chai Latte', description: 'Spiced chai with frothy milk', price: 4.50, categoryId: 'tea', badge: 'Popular', image: 'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?w=400&h=300&fit=crop' },
  { id: 13, name: 'Earl Grey', description: 'Classic bergamot-infused black tea', price: 3.50, categoryId: 'tea', image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400&h=300&fit=crop' },
  { id: 14, name: 'Matcha Latte', description: 'Ceremonial grade matcha with oat milk', price: 5.50, categoryId: 'tea', image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=300&fit=crop' },
  { id: 15, name: 'London Fog', description: 'Earl grey, vanilla, steamed milk', price: 5.00, categoryId: 'tea', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop' },
  { id: 16, name: 'Peppermint Tea', description: 'Fresh mint leaves, naturally soothing', price: 3.50, categoryId: 'tea', image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop' },
  { id: 17, name: 'Jasmine Oolong', description: 'Floral jasmine pearl oolong', price: 4.00, categoryId: 'tea', badge: 'New', image: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=400&h=300&fit=crop' },
  { id: 18, name: 'Berry Blast', description: 'Strawberry, blueberry, banana, yogurt', price: 6.50, categoryId: 'smoothies', badge: 'Popular', image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop' },
  { id: 19, name: 'Mango Tropical', description: 'Mango, pineapple, coconut milk', price: 6.50, categoryId: 'smoothies', image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop' },
  { id: 20, name: 'Green Power', description: 'Spinach, banana, apple, ginger', price: 7.00, categoryId: 'smoothies', image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop' },
  { id: 21, name: 'Peanut Butter Cup', description: 'Banana, peanut butter, cocoa, oat milk', price: 7.00, categoryId: 'smoothies', image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=300&fit=crop' },
  { id: 22, name: 'Peach Sunrise', description: 'Peach, mango, orange juice, chia seeds', price: 6.50, categoryId: 'smoothies', badge: 'New', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop' },
  { id: 23, name: 'Croissant', description: 'Buttery, flaky, golden', price: 3.50, categoryId: 'pastries', badge: 'Fresh', image: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400&h=300&fit=crop' },
  { id: 24, name: 'Blueberry Muffin', description: 'Loaded with wild blueberries', price: 4.00, categoryId: 'pastries', image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop' },
  { id: 25, name: 'Cinnamon Roll', description: 'Warm with cream cheese glaze', price: 4.50, categoryId: 'pastries', badge: 'Fresh', image: 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400&h=300&fit=crop' },
  { id: 26, name: 'Chocolate Brownie', description: 'Dark chocolate, fudgy center', price: 4.00, categoryId: 'pastries', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop' },
  { id: 27, name: 'Almond Biscotti', description: 'Crunchy almond biscuit, perfect for dipping', price: 3.00, categoryId: 'pastries', image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&h=300&fit=crop' },
  { id: 28, name: 'Banana Bread', description: 'Moist banana bread with walnut chunks', price: 4.00, categoryId: 'pastries', image: 'https://images.unsplash.com/photo-1604882737321-e1c2e0e3b284?w=400&h=300&fit=crop' },
  { id: 29, name: 'Scone', description: 'Classic buttermilk scone with jam', price: 3.50, categoryId: 'pastries', image: 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400&h=300&fit=crop' },
  { id: 30, name: 'Pain au Chocolat', description: 'Flaky pastry with dark chocolate filling', price: 4.00, categoryId: 'pastries', badge: 'Fresh', image: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400&h=300&fit=crop' },
  { id: 31, name: 'Tiramisu', description: 'Classic Italian coffee-flavored layered dessert', price: 7.00, categoryId: 'desserts', badge: 'Popular', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop' },
  { id: 32, name: 'Cheesecake', description: 'New York style with berry compote', price: 6.50, categoryId: 'desserts', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop' },
  { id: 33, name: 'Creme Brulee', description: 'Vanilla custard with caramelized sugar crust', price: 7.50, categoryId: 'desserts', image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=300&fit=crop' },
  { id: 34, name: 'Chocolate Lava Cake', description: 'Warm molten center, served with cream', price: 8.00, categoryId: 'desserts', badge: 'New', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop' },
  { id: 35, name: 'Panna Cotta', description: 'Silky vanilla custard with caramel drizzle', price: 6.50, categoryId: 'desserts', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop' },
  { id: 36, name: 'Avocado Toast', description: 'Sourdough, smashed avo, chili flakes', price: 8.50, categoryId: 'sandwiches', badge: 'Popular', image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop' },
  { id: 37, name: 'Caprese Panini', description: 'Mozzarella, tomato, basil, balsamic', price: 9.00, categoryId: 'sandwiches', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop' },
  { id: 38, name: 'Turkey Club', description: 'Roasted turkey, bacon, lettuce, tomato', price: 9.50, categoryId: 'sandwiches', image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&h=300&fit=crop' },
  { id: 39, name: 'Veggie Wrap', description: 'Hummus, grilled veggies, mixed greens', price: 8.50, categoryId: 'sandwiches', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop' },
  { id: 40, name: 'Chicken Pesto', description: 'Grilled chicken, pesto, mozzarella, ciabatta', price: 10.00, categoryId: 'sandwiches', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop' },
  { id: 41, name: 'BLT Classic', description: 'Bacon, lettuce, tomato on sourdough', price: 8.50, categoryId: 'sandwiches', image: 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=400&h=300&fit=crop' },
  { id: 42, name: 'Grilled Cheese', description: 'Three cheese blend on buttery sourdough', price: 7.50, categoryId: 'sandwiches', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop' }
];

const FALLBACK_CATEGORIES = [
  { id: 'coffee', name: 'Coffee' },
  { id: 'tea', name: 'Tea' },
  { id: 'smoothies', name: 'Smoothies' },
  { id: 'pastries', name: 'Pastries' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'sandwiches', name: 'Sandwiches' }
];

// ===== MENU SERVICE =====
const MenuService = {
  async getAll() {
    try {
      const data = await API.get('/menu');
      return data;
    } catch {
      return { categories: FALLBACK_CATEGORIES, items: FALLBACK_MENU };
    }
  },

  async getById(id) {
    try {
      return await API.get(`/menu/${id}`);
    } catch {
      return FALLBACK_MENU.find(i => i.id === id) || null;
    }
  },

  async getByCategory(category) {
    try {
      return await API.get(`/menu?category=${category}`);
    } catch {
      return category === 'all' ? FALLBACK_MENU : FALLBACK_MENU.filter(i => i.categoryId === category);
    }
  },

  async search(query) {
    try {
      return await API.get(`/menu/search?q=${query}`);
    } catch {
      const q = query.toLowerCase();
      return FALLBACK_MENU.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
  }
};

// ===== AUTH SERVICE =====
const AuthService = {
  async register(data) {
    try {
      return await API.post('/auth/register', data);
    } catch (err) {
      const users = JSON.parse(localStorage.getItem('cafe_users') || '[]');
      if (users.find(u => u.email === data.email)) {
        throw { message: 'An account with this email already exists.' };
      }
      const user = { id: Date.now(), name: data.name, email: data.email, password: data.password };
      users.push(user);
      localStorage.setItem('cafe_users', JSON.stringify(users));
      return { message: 'Account created successfully.' };
    }
  },

  async login(data) {
    try {
      return await API.post('/auth/login', data);
    } catch {
      const users = JSON.parse(localStorage.getItem('cafe_users') || '[]');
      const user = users.find(u => u.email === data.email && u.password === data.password);
      if (!user) throw { message: 'Invalid email or password.' };
      return { name: user.name, email: user.email, token: 'local-token' };
    }
  },

  async getProfile() {
    try {
      return await API.get('/auth/profile');
    } catch {
      const session = JSON.parse(localStorage.getItem('cafe_session') || 'null');
      if (!session) throw { message: 'Not logged in.' };
      return session;
    }
  },

  logout() {
    localStorage.removeItem('cafe_session');
    window.location.href = 'index.html';
  }
};

// ===== CART SERVICE =====
const CartService = {
  async get() {
    try {
      return await API.get('/cart');
    } catch {
      return JSON.parse(localStorage.getItem('cafe_cart') || '[]');
    }
  },

  async addItem(itemId, qty = 1) {
    try {
      return await API.post('/cart', { itemId, qty });
    } catch {
      const cart = JSON.parse(localStorage.getItem('cafe_cart') || '[]');
      const existing = cart.find(c => c.id === itemId);
      if (existing) {
        existing.qty += qty;
      } else {
        const menu = FALLBACK_MENU.find(m => m.id === itemId);
        if (menu) cart.push({ id: menu.id, name: menu.name, price: menu.price, image: menu.image, qty });
      }
      localStorage.setItem('cafe_cart', JSON.stringify(cart));
      return cart;
    }
  },

  async updateQty(itemId, qty) {
    try {
      return await API.put(`/cart/${itemId}`, { qty });
    } catch {
      let cart = JSON.parse(localStorage.getItem('cafe_cart') || '[]');
      if (qty <= 0) {
        cart = cart.filter(c => c.id !== itemId);
      } else {
        const item = cart.find(c => c.id === itemId);
        if (item) item.qty = qty;
      }
      localStorage.setItem('cafe_cart', JSON.stringify(cart));
      return cart;
    }
  },

  async removeItem(itemId) {
    try {
      return await API.delete(`/cart/${itemId}`);
    } catch {
      let cart = JSON.parse(localStorage.getItem('cafe_cart') || '[]');
      cart = cart.filter(c => c.id !== itemId);
      localStorage.setItem('cafe_cart', JSON.stringify(cart));
      return cart;
    }
  },

  async clear() {
    try {
      return await API.delete('/cart');
    } catch {
      localStorage.setItem('cafe_cart', '[]');
      return [];
    }
  }
};

// ===== ORDER SERVICE =====
const OrderService = {
  async checkout(data) {
    try {
      return await API.post('/orders/checkout', data);
    } catch {
      localStorage.setItem('cafe_cart', '[]');
      return { message: 'Order placed successfully!', orderId: 'ORD-' + Date.now() };
    }
  },

  async getOrders() {
    try {
      return await API.get('/orders');
    } catch {
      return [];
    }
  }
};

// ===== ERROR HANDLER =====
function handleApiError(error) {
  if (error?.status === 401) {
    localStorage.removeItem('cafe_session');
    window.location.href = 'login.html';
  }
  alert(error?.message || 'An error occurred. Please try again.');
}
